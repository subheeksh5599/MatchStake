# MatchStake Smart Contract

`MatchStake.sol` is a peer-to-peer escrow betting contract deployed on **X Layer Testnet** (Chain ID 195).

## Overview

Two users place opposing bets on a sports match outcome. Funds are locked in the contract until an admin resolves the result — the winner receives both stakes, or each player gets their stake back on a draw.

## Contract Address

After deploying, the address is saved to `../deployment.json`. See `../../DEPLOYMENT.md` for full instructions.

---

## State Machine

```
createBet()    →  PENDING
joinBet()      →  ACTIVE       (from PENDING)
cancelBet()    →  CANCELLED    (from PENDING — creator or admin)
resolveBet()   →  RESOLVED     (from ACTIVE — admin only)
```

---

## Enumerations

### `BetStatus`

| Value | Description |
|-------|-------------|
| `PENDING` | Bet created; waiting for a second player to join |
| `ACTIVE` | Both players locked in; awaiting match outcome |
| `RESOLVED` | Outcome recorded; winnings distributed |
| `CANCELLED` | Creator cancelled before anyone joined; funds refunded |

### `Outcome`

| Value | Description |
|-------|-------------|
| `PENDING` | Match not yet resolved |
| `TEAM_A` | Bet creator (Team A side) wins |
| `TEAM_B` | Bet joiner (Team B side) wins |
| `DRAW` | Both players receive their original stake back |

---

## Structs

### `Bet`

```solidity
struct Bet {
    uint256  betId;
    string   matchName;
    address  teamABetter;   // creator
    address  teamBBetter;   // joiner (address(0) until joined)
    uint256  amount;        // stake per player, in wei
    BetStatus status;
    Outcome   outcome;
    uint256  createdAt;     // block.timestamp at creation
    uint256  resolvedAt;    // block.timestamp at resolution (0 until resolved)
}
```

---

## Functions

### `createBet(string matchName, uint256 amount) returns (uint256 betId)`

Creates a new bet. The caller must send `amount` wei with the transaction (`msg.value == amount`). The bet starts in `PENDING` status.

**Requirements**
- `msg.value == amount`
- `amount > 0`

**Emits** `BetCreated(betId, matchName, creator, amount)`

---

### `joinBet(uint256 betId)`

Joins an existing `PENDING` bet. The caller must send exactly `bet.amount` wei. The caller cannot be the same address as the creator. On success, the bet moves to `ACTIVE`.

**Requirements**
- Bet must exist and be `PENDING`
- `msg.value == bet.amount`
- `msg.sender != bet.teamABetter`

**Emits** `BetJoined(betId, joiner, ACTIVE)`

---

### `resolveBet(uint256 betId, Outcome outcome)` — admin only

Resolves an `ACTIVE` bet and distributes funds:

| Outcome | Transfer |
|---------|---------|
| `TEAM_A` | Creator receives `amount * 2` |
| `TEAM_B` | Joiner receives `amount * 2` |
| `DRAW` | Each player receives `amount` back |

**Requirements**
- Caller must be `admin`
- Bet must be `ACTIVE`
- `outcome` must be `TEAM_A`, `TEAM_B`, or `DRAW`

**Emits** `BetResolved(betId, outcome, winner, winnings)`
> For draws, `winner` is `address(0)` and `winnings` is the per-player refund.

---

### `cancelBet(uint256 betId)`

Cancels a `PENDING` bet and refunds the creator. Can be called by the bet creator or the admin.

**Requirements**
- Bet must be `PENDING`
- Caller must be the creator or `admin`

**Emits** `BetCancelled(betId)`

---

### `getBet(uint256 betId) view returns (...)`

Returns the stored fields of a single bet:
`(betId, matchName, teamABetter, teamBBetter, amount, BetStatus, Outcome)`

---

### `getActiveBets() view returns (Bet[])`

Returns all bets currently in `PENDING` or `ACTIVE` status.

> Gas note: iterates all historical bets. Acceptable at hackathon scale; use a Subgraph for high-volume production deployments.

---

### `setAdmin(address newAdmin)` — admin only

Transfers the admin role to `newAdmin`. Use this to assign a multisig before mainnet deployment.

---

## Events

| Event | Parameters | Fired when |
|-------|-----------|-----------|
| `BetCreated` | `betId, matchName, creator, amount` | New bet created |
| `BetJoined` | `betId, joiner, status` | Second player joins |
| `BetResolved` | `betId, outcome, winner, winnings` | Outcome set and funds sent |
| `BetCancelled` | `betId` | Pending bet refunded to creator |

---

## State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `bets` | `mapping(uint256 => Bet)` | All bets by ID |
| `nextBetId` | `uint256` | Next ID to assign (starts at 1) |
| `admin` | `address` | Address authorised to resolve bets |
| `totalBets` | `uint256` | Lifetime total bets created |

---

## Security

- Follows the **Checks-Effects-Interactions** pattern: all state changes happen before any ETH transfer.
- All low-level `.call{value}("")` transfers are checked with `require(success, ...)`.
- The `onlyAdmin` modifier restricts sensitive operations.

See `../../SECURITY.md` for the full threat model and mainnet recommendations.

---

## Running Tests

```bash
# From the contracts/ directory
npm test
```

The test suite covers deployment, create/join/resolve/cancel flows, draw payouts, permission checks, and event emissions (15+ test cases).
