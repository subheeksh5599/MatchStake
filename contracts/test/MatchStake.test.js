const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MatchStake", function () {
  let matchStake;
  let admin;
  let userA;
  let userB;
  const BET_AMOUNT = ethers.parseEther("10");

  beforeEach(async function () {
    [admin, userA, userB] = await ethers.getSigners();
    const MatchStake = await ethers.getContractFactory("MatchStake");
    matchStake = await MatchStake.deploy();
    await matchStake.waitForDeployment();
  });

  // ─── Deployment ───────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("sets the deployer as admin", async function () {
      expect(await matchStake.admin()).to.equal(admin.address);
    });

    it("starts with nextBetId = 1", async function () {
      expect(await matchStake.nextBetId()).to.equal(1);
    });
  });

  // ─── Creating Bets ────────────────────────────────────────────────────────

  describe("Creating Bets", function () {
    it("creates a bet and stores the creator's score prediction", async function () {
      const tx = await matchStake
        .connect(userA)
        .createBet("Brazil vs France", BET_AMOUNT, 2, 1, { value: BET_AMOUNT });

      await expect(tx)
        .to.emit(matchStake, "BetCreated")
        .withArgs(1, "Brazil vs France", userA.address, BET_AMOUNT, 2, 1);

      const bet = await matchStake.getBet(1);
      expect(bet.betId).to.equal(1);
      expect(bet.matchName).to.equal("Brazil vs France");
      expect(bet.teamABetter).to.equal(userA.address);
      expect(bet.amount).to.equal(BET_AMOUNT);
      expect(bet.creatorHomeGoals).to.equal(2);
      expect(bet.creatorAwayGoals).to.equal(1);
      expect(bet.status).to.equal(0); // PENDING
    });

    it("accepts a 0-0 prediction", async function () {
      await matchStake
        .connect(userA)
        .createBet("Brazil vs France", BET_AMOUNT, 0, 0, { value: BET_AMOUNT });
      const bet = await matchStake.getBet(1);
      expect(bet.creatorHomeGoals).to.equal(0);
      expect(bet.creatorAwayGoals).to.equal(0);
    });

    it("reverts when sent value does not match amount", async function () {
      await expect(
        matchStake
          .connect(userA)
          .createBet("Brazil vs France", BET_AMOUNT, 2, 1, {
            value: ethers.parseEther("5"),
          })
      ).to.be.revertedWith("Sent value must equal bet amount");
    });

    it("reverts with zero amount", async function () {
      await expect(
        matchStake
          .connect(userA)
          .createBet("Brazil vs France", 0, 0, 0, { value: 0 })
      ).to.be.revertedWith("Bet amount must be greater than 0");
    });
  });

  // ─── Joining Bets ─────────────────────────────────────────────────────────

  describe("Joining Bets", function () {
    beforeEach(async function () {
      // Creator predicts 2-1
      await matchStake
        .connect(userA)
        .createBet("Brazil vs France", BET_AMOUNT, 2, 1, { value: BET_AMOUNT });
    });

    it("records the joiner's prediction and moves bet to ACTIVE", async function () {
      const tx = await matchStake
        .connect(userB)
        .joinBet(1, 1, 2, { value: BET_AMOUNT });

      await expect(tx)
        .to.emit(matchStake, "BetJoined")
        .withArgs(1, userB.address, 1, 2, 1); // 1 = ACTIVE

      const bet = await matchStake.getBet(1);
      expect(bet.teamBBetter).to.equal(userB.address);
      expect(bet.joinerHomeGoals).to.equal(1);
      expect(bet.joinerAwayGoals).to.equal(2);
      expect(bet.status).to.equal(1); // ACTIVE
    });

    it("allows joining with the same prediction as the creator (will draw)", async function () {
      // Same prediction is valid — contract resolves it as a draw
      await expect(
        matchStake.connect(userB).joinBet(1, 2, 1, { value: BET_AMOUNT })
      ).to.not.be.reverted;
    });

    it("reverts when user tries to bet against themselves", async function () {
      await expect(
        matchStake.connect(userA).joinBet(1, 0, 0, { value: BET_AMOUNT })
      ).to.be.revertedWith("Cannot bet against yourself");
    });

    it("reverts when sent amount does not match", async function () {
      await expect(
        matchStake
          .connect(userB)
          .joinBet(1, 1, 0, { value: ethers.parseEther("5") })
      ).to.be.revertedWith("Amount must match bet amount");
    });

    it("reverts when the bet already has two participants", async function () {
      await matchStake.connect(userB).joinBet(1, 1, 0, { value: BET_AMOUNT });

      const [, , , user3] = await ethers.getSigners();
      await expect(
        matchStake.connect(user3).joinBet(1, 0, 0, { value: BET_AMOUNT })
      ).to.be.revertedWith("Bet already has 2 participants");
    });
  });

  // ─── Resolving Bets — Score Closeness ────────────────────────────────────

  describe("Resolving Bets — Score Closeness", function () {
    // Creator (userA) predicts 3-1
    // Joiner  (userB) predicts 1-1

    beforeEach(async function () {
      await matchStake
        .connect(userA)
        .createBet("Brazil vs France", BET_AMOUNT, 3, 1, { value: BET_AMOUNT });
      await matchStake.connect(userB).joinBet(1, 1, 1, { value: BET_AMOUNT });
    });

    it("creator wins when their prediction is closer", async function () {
      // Actual 3-0 → creator dist = |3-3|+|1-0| = 1, joiner dist = |1-3|+|1-0| = 3
      const balBefore = await ethers.provider.getBalance(userA.address);

      const tx = await matchStake.connect(admin).resolveBet(1, 3, 0);
      await tx.wait();

      await expect(tx)
        .to.emit(matchStake, "BetResolved")
        .withArgs(1, 1, userA.address, BET_AMOUNT * 2n, 3, 0); // 1 = TEAM_A

      const bet = await matchStake.getBet(1);
      expect(bet.outcome).to.equal(1); // TEAM_A
      expect(bet.status).to.equal(2); // RESOLVED
      expect(bet.actualHomeGoals).to.equal(3);
      expect(bet.actualAwayGoals).to.equal(0);

      const balAfter = await ethers.provider.getBalance(userA.address);
      expect(balAfter).to.be.gt(balBefore);
    });

    it("joiner wins when their prediction is closer", async function () {
      // Actual 1-2 → creator dist = |3-1|+|1-2| = 3, joiner dist = |1-1|+|1-2| = 1
      const balBefore = await ethers.provider.getBalance(userB.address);

      const tx = await matchStake.connect(admin).resolveBet(1, 1, 2);
      await tx.wait();

      await expect(tx)
        .to.emit(matchStake, "BetResolved")
        .withArgs(1, 2, userB.address, BET_AMOUNT * 2n, 1, 2); // 2 = TEAM_B

      const bet = await matchStake.getBet(1);
      expect(bet.outcome).to.equal(2); // TEAM_B

      const balAfter = await ethers.provider.getBalance(userB.address);
      expect(balAfter).to.be.gt(balBefore);
    });

    it("draw when both predictions are equally close — refunds both", async function () {
      // Actual 2-1 → creator dist = |3-2|+|1-1| = 1, joiner dist = |1-2|+|1-1| = 1 → DRAW
      const balABefore = await ethers.provider.getBalance(userA.address);
      const balBBefore = await ethers.provider.getBalance(userB.address);

      const tx = await matchStake.connect(admin).resolveBet(1, 2, 1);
      await tx.wait();

      const bet = await matchStake.getBet(1);
      expect(bet.outcome).to.equal(3); // DRAW
      expect(bet.status).to.equal(2); // RESOLVED

      const balAAfter = await ethers.provider.getBalance(userA.address);
      const balBAfter = await ethers.provider.getBalance(userB.address);
      expect(balAAfter).to.be.gt(balABefore);
      expect(balBAfter).to.be.gt(balBBefore);
    });

    it("exact match by creator → creator wins with distance 0", async function () {
      // Creator predicted 3-1, actual IS 3-1
      const tx = await matchStake.connect(admin).resolveBet(1, 3, 1);
      await tx.wait();
      const bet = await matchStake.getBet(1);
      expect(bet.outcome).to.equal(1); // TEAM_A
    });

    it("exact match by joiner → joiner wins with distance 0", async function () {
      // Joiner predicted 1-1, actual IS 1-1
      const tx = await matchStake.connect(admin).resolveBet(1, 1, 1);
      await tx.wait();
      const bet = await matchStake.getBet(1);
      expect(bet.outcome).to.equal(2); // TEAM_B
    });

    it("same prediction by both → always draw regardless of actual score", async function () {
      // Both predict 2-0; regardless of actual, distances are always equal
      await matchStake
        .connect(userA)
        .createBet("Spain vs Italy", BET_AMOUNT, 2, 0, { value: BET_AMOUNT });
      await matchStake.connect(userB).joinBet(2, 2, 0, { value: BET_AMOUNT });

      await matchStake.connect(admin).resolveBet(2, 5, 3);
      const bet = await matchStake.getBet(2);
      expect(bet.outcome).to.equal(3); // DRAW
    });

    it("reverts if a non-admin tries to resolve", async function () {
      await expect(
        matchStake.connect(userA).resolveBet(1, 2, 1)
      ).to.be.revertedWith("Only admin can resolve bets");
    });

    it("reverts if the bet is not active", async function () {
      await matchStake.connect(admin).resolveBet(1, 2, 1);
      await expect(
        matchStake.connect(admin).resolveBet(1, 3, 1)
      ).to.be.revertedWith("Bet must be active to resolve");
    });
  });

  // ─── Cancelling Bets ──────────────────────────────────────────────────────

  describe("Cancelling Bets", function () {
    beforeEach(async function () {
      await matchStake
        .connect(userA)
        .createBet("Brazil vs France", BET_AMOUNT, 2, 1, { value: BET_AMOUNT });
    });

    it("creator can cancel a pending bet and receives a refund", async function () {
      const balBefore = await ethers.provider.getBalance(userA.address);

      const tx = await matchStake.connect(userA).cancelBet(1);
      await expect(tx).to.emit(matchStake, "BetCancelled").withArgs(1);

      const bet = await matchStake.getBet(1);
      expect(bet.status).to.equal(3); // CANCELLED

      const balAfter = await ethers.provider.getBalance(userA.address);
      expect(balAfter).to.be.gt(balBefore);
    });

    it("admin can cancel a pending bet", async function () {
      const tx = await matchStake.connect(admin).cancelBet(1);
      await expect(tx).to.emit(matchStake, "BetCancelled").withArgs(1);
    });

    it("reverts when trying to cancel an active bet", async function () {
      await matchStake.connect(userB).joinBet(1, 0, 0, { value: BET_AMOUNT });
      await expect(matchStake.connect(userA).cancelBet(1)).to.be.revertedWith(
        "Only pending bets can be cancelled"
      );
    });

    it("reverts when a third party tries to cancel", async function () {
      const [, , , user3] = await ethers.getSigners();
      await expect(matchStake.connect(user3).cancelBet(1)).to.be.revertedWith(
        "Not authorized"
      );
    });
  });

  // ─── Active Bets ──────────────────────────────────────────────────────────

  describe("Getting Active Bets", function () {
    it("returns pending and active bets with all score fields", async function () {
      await matchStake
        .connect(userA)
        .createBet("Brazil vs France", BET_AMOUNT, 2, 1, { value: BET_AMOUNT });
      await matchStake
        .connect(userA)
        .createBet("Argentina vs Germany", BET_AMOUNT, 3, 0, {
          value: BET_AMOUNT,
        });

      await matchStake.connect(userB).joinBet(1, 1, 2, { value: BET_AMOUNT });

      const activeBets = await matchStake.getActiveBets();
      expect(activeBets.length).to.equal(2);

      // First bet is now ACTIVE — both predictions stored
      expect(activeBets[0].matchName).to.equal("Brazil vs France");
      expect(activeBets[0].creatorHomeGoals).to.equal(2);
      expect(activeBets[0].joinerHomeGoals).to.equal(1);
      expect(activeBets[0].status).to.equal(1); // ACTIVE

      // Second bet still PENDING
      expect(activeBets[1].matchName).to.equal("Argentina vs Germany");
      expect(activeBets[1].status).to.equal(0); // PENDING
    });

    it("excludes resolved and cancelled bets", async function () {
      await matchStake
        .connect(userA)
        .createBet("Brazil vs France", BET_AMOUNT, 2, 1, { value: BET_AMOUNT });
      await matchStake.connect(userB).joinBet(1, 1, 0, { value: BET_AMOUNT });
      await matchStake.connect(admin).resolveBet(1, 2, 1);

      const activeBets = await matchStake.getActiveBets();
      expect(activeBets.length).to.equal(0);
    });
  });

  // ─── Admin Management ─────────────────────────────────────────────────────

  describe("Admin Management", function () {
    it("allows admin to transfer the admin role", async function () {
      await matchStake.connect(admin).setAdmin(userA.address);
      expect(await matchStake.admin()).to.equal(userA.address);
    });

    it("prevents the old admin from resolving after transfer", async function () {
      await matchStake.connect(admin).setAdmin(userA.address);

      await matchStake
        .connect(userA)
        .createBet("Spain vs Italy", BET_AMOUNT, 1, 0, { value: BET_AMOUNT });
      await matchStake.connect(userB).joinBet(1, 0, 1, { value: BET_AMOUNT });

      await expect(
        matchStake.connect(admin).resolveBet(1, 1, 0)
      ).to.be.revertedWith("Only admin can resolve bets");
    });
  });
});
