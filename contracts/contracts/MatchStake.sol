// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MatchStake {
    enum BetStatus {
        PENDING,
        ACTIVE,
        RESOLVED,
        CANCELLED
    }

    enum Outcome {
        PENDING,
        TEAM_A,
        TEAM_B,
        DRAW
    }

    struct Bet {
        uint256 betId;
        string matchName;
        address teamABetter;
        address teamBBetter;
        uint256 amount;
        BetStatus status;
        Outcome outcome;
        uint256 createdAt;
        uint256 resolvedAt;
        // Score predictions
        uint8 creatorHomeGoals;
        uint8 creatorAwayGoals;
        uint8 joinerHomeGoals;
        uint8 joinerAwayGoals;
        // Actual score — written at resolution
        uint8 actualHomeGoals;
        uint8 actualAwayGoals;
    }

    mapping(uint256 => Bet) public bets;
    uint256 public nextBetId = 1;
    address public admin;
    uint256 public totalBets = 0;

    event BetCreated(
        uint256 indexed betId,
        string matchName,
        address indexed creator,
        uint256 amount,
        uint8 homeGoals,
        uint8 awayGoals
    );

    event BetJoined(
        uint256 indexed betId,
        address indexed joiner,
        uint8 homeGoals,
        uint8 awayGoals,
        BetStatus status
    );

    event BetResolved(
        uint256 indexed betId,
        Outcome outcome,
        address winner,
        uint256 winnings,
        uint8 actualHomeGoals,
        uint8 actualAwayGoals
    );

    event BetCancelled(uint256 indexed betId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can resolve bets");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Create a new pending bet with a score prediction.
    /// @param matchName  Human-readable match label (e.g. "Brazil vs France").
    /// @param amount     Stake in wei — must equal msg.value.
    /// @param homeGoals  Creator's predicted home-team goals.
    /// @param awayGoals  Creator's predicted away-team goals.
    function createBet(
        string memory matchName,
        uint256 amount,
        uint8 homeGoals,
        uint8 awayGoals
    ) external payable returns (uint256) {
        require(msg.value == amount, "Sent value must equal bet amount");
        require(amount > 0, "Bet amount must be greater than 0");

        uint256 betId = nextBetId;
        nextBetId++;
        totalBets++;

        bets[betId] = Bet({
            betId: betId,
            matchName: matchName,
            teamABetter: msg.sender,
            teamBBetter: address(0),
            amount: amount,
            status: BetStatus.PENDING,
            outcome: Outcome.PENDING,
            createdAt: block.timestamp,
            resolvedAt: 0,
            creatorHomeGoals: homeGoals,
            creatorAwayGoals: awayGoals,
            joinerHomeGoals: 0,
            joinerAwayGoals: 0,
            actualHomeGoals: 0,
            actualAwayGoals: 0
        });

        emit BetCreated(betId, matchName, msg.sender, amount, homeGoals, awayGoals);
        return betId;
    }

    /// @notice Join an existing pending bet with your own score prediction.
    /// @param betId      ID of the pending bet to join.
    /// @param homeGoals  Joiner's predicted home-team goals.
    /// @param awayGoals  Joiner's predicted away-team goals.
    function joinBet(
        uint256 betId,
        uint8 homeGoals,
        uint8 awayGoals
    ) external payable {
        Bet storage bet = bets[betId];
        require(bet.betId == betId, "Bet does not exist");
        require(bet.teamBBetter == address(0), "Bet already has 2 participants");
        require(bet.status == BetStatus.PENDING, "Bet is not available");
        require(msg.value == bet.amount, "Amount must match bet amount");
        require(msg.sender != bet.teamABetter, "Cannot bet against yourself");

        bet.teamBBetter = msg.sender;
        bet.joinerHomeGoals = homeGoals;
        bet.joinerAwayGoals = awayGoals;
        bet.status = BetStatus.ACTIVE;

        emit BetJoined(betId, msg.sender, homeGoals, awayGoals, BetStatus.ACTIVE);
    }

    /// @notice Settle an active bet by entering the real final score.
    ///         The contract computes the winner using Manhattan distance.
    ///         Equal distances → draw, both players refunded.
    /// @param betId       ID of the active bet to resolve.
    /// @param actualHome  Actual home-team goals.
    /// @param actualAway  Actual away-team goals.
    function resolveBet(
        uint256 betId,
        uint8 actualHome,
        uint8 actualAway
    ) external onlyAdmin {
        Bet storage bet = bets[betId];
        require(bet.betId == betId, "Bet does not exist");
        require(bet.status == BetStatus.ACTIVE, "Bet must be active to resolve");

        // Write state before any external calls (CEI pattern)
        bet.status = BetStatus.RESOLVED;
        bet.resolvedAt = block.timestamp;
        bet.actualHomeGoals = actualHome;
        bet.actualAwayGoals = actualAway;

        uint256 creatorDist =
            _absDiff(bet.creatorHomeGoals, actualHome) +
            _absDiff(bet.creatorAwayGoals, actualAway);
        uint256 joinerDist =
            _absDiff(bet.joinerHomeGoals, actualHome) +
            _absDiff(bet.joinerAwayGoals, actualAway);

        if (creatorDist < joinerDist) {
            bet.outcome = Outcome.TEAM_A;
            address payable winner = payable(bet.teamABetter);
            uint256 totalPayout = bet.amount * 2;
            (bool success, ) = winner.call{value: totalPayout}("");
            require(success, "Transfer failed");
            emit BetResolved(betId, Outcome.TEAM_A, winner, totalPayout, actualHome, actualAway);
        } else if (joinerDist < creatorDist) {
            bet.outcome = Outcome.TEAM_B;
            address payable winner = payable(bet.teamBBetter);
            uint256 totalPayout = bet.amount * 2;
            (bool success, ) = winner.call{value: totalPayout}("");
            require(success, "Transfer failed");
            emit BetResolved(betId, Outcome.TEAM_B, winner, totalPayout, actualHome, actualAway);
        } else {
            // Equal distance — draw, refund both
            bet.outcome = Outcome.DRAW;
            (bool successA, ) = payable(bet.teamABetter).call{value: bet.amount}("");
            (bool successB, ) = payable(bet.teamBBetter).call{value: bet.amount}("");
            require(successA && successB, "Transfer failed");
            emit BetResolved(betId, Outcome.DRAW, address(0), bet.amount, actualHome, actualAway);
        }
    }

    /// @dev Manhattan distance between two uint8 values, safe from underflow.
    function _absDiff(uint8 a, uint8 b) internal pure returns (uint256) {
        return a >= b ? uint256(a - b) : uint256(b - a);
    }

    /// @notice Cancel a pending bet and refund the creator.
    ///         Can be called by the creator or the admin.
    function cancelBet(uint256 betId) external {
        Bet storage bet = bets[betId];
        require(bet.betId == betId, "Bet does not exist");
        require(bet.status == BetStatus.PENDING, "Only pending bets can be cancelled");
        require(
            msg.sender == bet.teamABetter || msg.sender == admin,
            "Not authorized"
        );

        bet.status = BetStatus.CANCELLED;
        (bool success, ) = payable(bet.teamABetter).call{value: bet.amount}("");
        require(success, "Refund failed");

        emit BetCancelled(betId);
    }

    /// @notice Returns the full Bet struct for a given ID.
    function getBet(uint256 betId) external view returns (Bet memory) {
        return bets[betId];
    }

    /// @notice Returns all bets currently in PENDING or ACTIVE status.
    function getActiveBets() external view returns (Bet[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextBetId; i++) {
            if (
                bets[i].status == BetStatus.PENDING ||
                bets[i].status == BetStatus.ACTIVE
            ) {
                activeCount++;
            }
        }

        Bet[] memory activeBets = new Bet[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i < nextBetId; i++) {
            if (
                bets[i].status == BetStatus.PENDING ||
                bets[i].status == BetStatus.ACTIVE
            ) {
                activeBets[index] = bets[i];
                index++;
            }
        }
        return activeBets;
    }

    /// @notice Transfer the admin role to a new address.
    function setAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }

    receive() external payable {}
}
