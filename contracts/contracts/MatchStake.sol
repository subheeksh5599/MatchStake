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
    }

    mapping(uint256 => Bet) public bets;
    uint256 public nextBetId = 1;
    address public admin;
    uint256 public totalBets = 0;

    event BetCreated(
        uint256 indexed betId,
        string matchName,
        address indexed creator,
        uint256 amount
    );

    event BetJoined(
        uint256 indexed betId,
        address indexed joiner,
        BetStatus status
    );

    event BetResolved(
        uint256 indexed betId,
        Outcome outcome,
        address winner,
        uint256 winnings
    );

    event BetCancelled(uint256 indexed betId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can resolve bets");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createBet(string memory matchName, uint256 amount)
        external
        payable
        returns (uint256)
    {
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
            resolvedAt: 0
        });

        emit BetCreated(betId, matchName, msg.sender, amount);
        return betId;
    }

    function joinBet(uint256 betId) external payable {
        Bet storage bet = bets[betId];
        require(bet.betId == betId, "Bet does not exist");
        require(bet.teamBBetter == address(0), "Bet already has 2 participants");
        require(bet.status == BetStatus.PENDING, "Bet is not available");
        require(msg.value == bet.amount, "Amount must match bet amount");
        require(msg.sender != bet.teamABetter, "Cannot bet against yourself");

        bet.teamBBetter = msg.sender;
        bet.status = BetStatus.ACTIVE;

        emit BetJoined(betId, msg.sender, BetStatus.ACTIVE);
    }

    function resolveBet(uint256 betId, Outcome outcome) external onlyAdmin {
        Bet storage bet = bets[betId];
        require(bet.betId == betId, "Bet does not exist");
        require(bet.status == BetStatus.ACTIVE, "Bet must be active to resolve");
        require(
            outcome == Outcome.TEAM_A ||
                outcome == Outcome.TEAM_B ||
                outcome == Outcome.DRAW,
            "Invalid outcome"
        );

        bet.outcome = outcome;
        bet.status = BetStatus.RESOLVED;
        bet.resolvedAt = block.timestamp;

        address payable winner;
        if (outcome == Outcome.TEAM_A) {
            winner = payable(bet.teamABetter);
        } else if (outcome == Outcome.TEAM_B) {
            winner = payable(bet.teamBBetter);
        } else {
            // Draw: split the pot
            uint256 winnings = bet.amount;
            (bool successA, ) = payable(bet.teamABetter).call{
                value: winnings
            }("");
            (bool successB, ) = payable(bet.teamBBetter).call{
                value: winnings
            }("");
            require(successA && successB, "Transfer failed");
            emit BetResolved(betId, outcome, address(0), bet.amount);
            return;
        }

        uint256 totalPayout = bet.amount * 2;
        (bool success, ) = winner.call{value: totalPayout}("");
        require(success, "Transfer failed");

        emit BetResolved(betId, outcome, winner, totalPayout);
    }

    function cancelBet(uint256 betId) external {
        Bet storage bet = bets[betId];
        require(bet.betId == betId, "Bet does not exist");
        require(bet.status == BetStatus.PENDING, "Only pending bets can be cancelled");
        require(msg.sender == bet.teamABetter || msg.sender == admin, "Not authorized");

        bet.status = BetStatus.CANCELLED;
        (bool success, ) = payable(bet.teamABetter).call{value: bet.amount}(
            ""
        );
        require(success, "Refund failed");

        emit BetCancelled(betId);
    }

    function getBet(uint256 betId)
        external
        view
        returns (
            uint256,
            string memory,
            address,
            address,
            uint256,
            BetStatus,
            Outcome
        )
    {
        Bet memory bet = bets[betId];
        return (
            bet.betId,
            bet.matchName,
            bet.teamABetter,
            bet.teamBBetter,
            bet.amount,
            bet.status,
            bet.outcome
        );
    }

    function getActiveBets()
        external
        view
        returns (Bet[] memory)
    {
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

    function setAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }

    receive() external payable {}
}
