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

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await matchStake.admin()).to.equal(admin.address);
    });
  });

  describe("Creating Bets", function () {
    it("Should allow creating a new bet", async function () {
      const tx = await matchStake.connect(userA).createBet("Brazil vs France", BET_AMOUNT, {
        value: BET_AMOUNT,
      });
      await expect(tx)
        .to.emit(matchStake, "BetCreated")
        .withArgs(1, "Brazil vs France", userA.address, BET_AMOUNT);

      const bet = await matchStake.getBet(1);
      expect(bet[0]).to.equal(1);
      expect(bet[1]).to.equal("Brazil vs France");
      expect(bet[2]).to.equal(userA.address);
      expect(bet[4]).to.equal(BET_AMOUNT);
    });

    it("Should fail if amount doesn't match", async function () {
      await expect(
        matchStake.connect(userA).createBet("Brazil vs France", BET_AMOUNT, {
          value: ethers.parseEther("5"),
        })
      ).to.be.revertedWith("Sent value must equal bet amount");
    });

    it("Should fail with zero amount", async function () {
      await expect(
        matchStake.connect(userA).createBet("Brazil vs France", 0, {
          value: 0,
        })
      ).to.be.revertedWith("Bet amount must be greater than 0");
    });
  });

  describe("Joining Bets", function () {
    beforeEach(async function () {
      await matchStake.connect(userA).createBet("Brazil vs France", BET_AMOUNT, {
        value: BET_AMOUNT,
      });
    });

    it("Should allow another user to join a pending bet", async function () {
      const tx = await matchStake.connect(userB).joinBet(1, {
        value: BET_AMOUNT,
      });

      await expect(tx)
        .to.emit(matchStake, "BetJoined");

      const bet = await matchStake.getBet(1);
      expect(bet[3]).to.equal(userB.address);
      expect(bet[5]).to.equal(1); // ACTIVE status
    });

    it("Should fail if user tries to bet against themselves", async function () {
      await expect(
        matchStake.connect(userA).joinBet(1, {
          value: BET_AMOUNT,
        })
      ).to.be.revertedWith("Cannot bet against yourself");
    });

    it("Should fail if amount doesn't match", async function () {
      await expect(
        matchStake.connect(userB).joinBet(1, {
          value: ethers.parseEther("5"),
        })
      ).to.be.revertedWith("Amount must match bet amount");
    });

    it("Should fail if bet already has 2 participants", async function () {
      await matchStake.connect(userB).joinBet(1, {
        value: BET_AMOUNT,
      });

      const [, , , user3] = await ethers.getSigners();
      await expect(
        matchStake.connect(user3).joinBet(1, {
          value: BET_AMOUNT,
        })
      ).to.be.revertedWith("Bet already has 2 participants");
    });
  });

  describe("Resolving Bets", function () {
    beforeEach(async function () {
      await matchStake.connect(userA).createBet("Brazil vs France", BET_AMOUNT, {
        value: BET_AMOUNT,
      });
      await matchStake.connect(userB).joinBet(1, {
        value: BET_AMOUNT,
      });
    });

    it("Should resolve bet with TEAM_A as winner", async function () {
      const initialBalance = await ethers.provider.getBalance(userA.address);
      
      const tx = await matchStake.connect(admin).resolveBet(1, 1); // 1 = TEAM_A
      await tx.wait();

      await expect(tx)
        .to.emit(matchStake, "BetResolved");

      const bet = await matchStake.getBet(1);
      expect(bet[6]).to.equal(1); // TEAM_A outcome
      expect(bet[5]).to.equal(2); // RESOLVED status
    });

    it("Should resolve bet with TEAM_B as winner", async function () {
      const tx = await matchStake.connect(admin).resolveBet(1, 2); // 2 = TEAM_B
      await tx.wait();

      await expect(tx)
        .to.emit(matchStake, "BetResolved");

      const bet = await matchStake.getBet(1);
      expect(bet[6]).to.equal(2); // TEAM_B outcome
    });

    it("Should handle DRAW outcome and split pot", async function () {
      const userAInitialBalance = await ethers.provider.getBalance(userA.address);
      const userBInitialBalance = await ethers.provider.getBalance(userB.address);

      const tx = await matchStake.connect(admin).resolveBet(1, 3); // 3 = DRAW
      await tx.wait();

      const bet = await matchStake.getBet(1);
      expect(bet[6]).to.equal(3); // DRAW outcome
    });

    it("Should fail if non-admin tries to resolve", async function () {
      await expect(
        matchStake.connect(userA).resolveBet(1, 1)
      ).to.be.revertedWith("Only admin can resolve bets");
    });

    it("Should fail if bet is not active", async function () {
      await matchStake.connect(admin).resolveBet(1, 1);
      
      await expect(
        matchStake.connect(admin).resolveBet(1, 2)
      ).to.be.revertedWith("Bet must be active to resolve");
    });
  });

  describe("Cancelling Bets", function () {
    beforeEach(async function () {
      await matchStake.connect(userA).createBet("Brazil vs France", BET_AMOUNT, {
        value: BET_AMOUNT,
      });
    });

    it("Should allow creator to cancel pending bet", async function () {
      const tx = await matchStake.connect(userA).cancelBet(1);
      await expect(tx)
        .to.emit(matchStake, "BetCancelled");

      const bet = await matchStake.getBet(1);
      expect(bet[5]).to.equal(3); // CANCELLED status
    });

    it("Should fail if trying to cancel active bet", async function () {
      await matchStake.connect(userB).joinBet(1, {
        value: BET_AMOUNT,
      });

      await expect(
        matchStake.connect(userA).cancelBet(1)
      ).to.be.revertedWith("Only pending bets can be cancelled");
    });
  });

  describe("Getting Active Bets", function () {
    it("Should return all pending and active bets", async function () {
      await matchStake.connect(userA).createBet("Brazil vs France", BET_AMOUNT, {
        value: BET_AMOUNT,
      });
      await matchStake.connect(userA).createBet("Argentina vs Germany", BET_AMOUNT, {
        value: BET_AMOUNT,
      });
      
      await matchStake.connect(userB).joinBet(1, {
        value: BET_AMOUNT,
      });

      const activeBets = await matchStake.getActiveBets();
      expect(activeBets.length).to.equal(2);
      expect(activeBets[0][1]).to.equal("Brazil vs France"); // First is active
      expect(activeBets[1][1]).to.equal("Argentina vs Germany"); // Second is pending
    });
  });
});
