# MatchStake — Technical Architecture

## System Overview

Four components work together to deliver the full MatchStake experience:

```mermaid
graph TD
    User["Browser + MetaMask"]:::accent0
    Frontend["React Frontend\nethers.js v6"]:::accent1
    Contract["MatchStake.sol\nX Layer Testnet"]:::accent2
    Backend["Node.js Backend\nProfile Registry"]:::accent3
    SportsDB["TheSportsDB API\nLive Match Schedule"]:::accent4

    User --> Frontend
    Frontend --> Contract
    Frontend --> Backend
    Frontend --> SportsDB
```

---

## Smart Contract Architecture

### Bet State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING : createBet()
    PENDING --> ACTIVE : joinBet()
    PENDING --> CANCELLED : cancelBet()\ncreator or admin
    ACTIVE --> RESOLVED : resolveBet(TEAM_A)
    ACTIVE --> RESOLVED : resolveBet(TEAM_B)
    ACTIVE --> RESOLVED : resolveBet(DRAW)
    RESOLVED --> [*]
    CANCELLED --> [*]
```

### Storage Layout

| Variable | Type | Description |
|----------|------|-------------|
| `bets` | `mapping(uint256 => Bet)` | All bets indexed by ID |
| `nextBetId` | `uint256` | Auto-incrementing ID counter |
| `admin` | `address` | Address authorised to resolve bets |
| `totalBets` | `uint256` | Lifetime bet count |

### `Bet` Struct

| Field | Type | Description |
|-------|------|-------------|
| `betId` | `uint256` | Unique identifier |
| `matchName` | `string` | Human-readable label (e.g. "Brazil vs France") |
| `teamABetter` | `address` | Bet creator — backs Team A |
| `teamBBetter` | `address` | Bet joiner — backs Team B |
| `amount` | `uint256` | Stake per player (wei) |
| `status` | `BetStatus` | `PENDING` / `ACTIVE` / `RESOLVED` / `CANCELLED` |
| `outcome` | `Outcome` | `PENDING` / `TEAM_A` / `TEAM_B` / `DRAW` |
| `createdAt` | `uint256` | Block timestamp of creation |
| `resolvedAt` | `uint256` | Block timestamp of resolution |

---

## Frontend Architecture

### Module Map

```mermaid
graph TD
    App["App.js\nRoot component"]:::accent0

    Web3["web3.js\nWallet + contract calls"]:::accent1
    Config["config.js\nABI + network constants"]:::accent2
    ContractConfig["contractConfig.js\nAddress resolver"]:::accent2

    MatchesAPI["matchesApi.js\nTheSportsDB / fallback"]:::accent3
    ProfileAPI["profileApi.js\nBackend REST calls"]:::accent4
    ProfileStorage["profileStorage.js\nlocalStorage + labels"]:::accent4

    App --> Web3
    App --> MatchesAPI
    App --> ProfileAPI
    App --> ProfileStorage
    Web3 --> Config
    Web3 --> ContractConfig
    ProfileAPI --> ProfileStorage
```

### Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `web3.js` | Wallet connection, network switching, contract method calls, event listeners |
| `config.js` | Contract ABI, chain ID, RPC URL, explorer base URL |
| `contractConfig.js` | Resolves contract address from three priority sources (see below) |
| `matchesApi.js` | Fetches upcoming fixtures from TheSportsDB; returns curated fallback list when offline |
| `profileApi.js` | Registers and fetches display names via the backend REST API |
| `profileStorage.js` | Persists known names in `localStorage`; generates stable anonymous labels for unknown wallets |

### Contract Address Resolution Priority

`contractConfig.js` tries sources in order and stops at the first valid EVM address:

```
1. /contract-address.json  (served from React public/ after sync-contract-address.js runs)
2. GET {API_URL}/api/config (backend endpoint)
3. REACT_APP_CONTRACT_ADDRESS environment variable
```

---

## Data Flows

### Create Bet

```mermaid
sequenceDiagram
    participant UA as User A
    participant FE as Frontend
    participant MM as MetaMask
    participant SC as MatchStake.sol

    UA->>FE: Enter match + amount, click Create
    FE->>MM: Send createBet(matchName, amount)
    MM->>UA: Confirm transaction
    UA->>MM: Approve
    MM->>SC: createBet(){value: amount}
    SC->>SC: Store Bet PENDING
    SC-->>FE: emit BetCreated
    FE-->>UA: Show pending bet in list
```

### Join Bet

```mermaid
sequenceDiagram
    participant UB as User B
    participant FE as Frontend
    participant MM as MetaMask
    participant SC as MatchStake.sol

    UB->>FE: Select pending bet, click Join
    FE->>MM: Send joinBet(betId)
    MM->>UB: Confirm transaction
    UB->>MM: Approve
    MM->>SC: joinBet(betId){value: amount}
    SC->>SC: Update Bet to ACTIVE
    SC-->>FE: emit BetJoined
    FE-->>UB: Show active bet with both players
```

### Resolve Bet

```mermaid
sequenceDiagram
    participant AD as Admin
    participant FE as Frontend
    participant MM as MetaMask
    participant SC as MatchStake.sol
    participant WN as Winner Wallet

    AD->>FE: Select outcome, click Resolve
    FE->>MM: Send resolveBet(betId, outcome)
    MM->>AD: Confirm transaction
    AD->>MM: Approve
    MM->>SC: resolveBet(betId, outcome)
    SC->>SC: Update Bet to RESOLVED
    SC->>WN: Transfer winnings
    SC-->>FE: emit BetResolved
    FE-->>AD: Show resolved status
```

### Profile Registration

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant MM as MetaMask
    participant BE as Backend API

    U->>FE: Enter display name
    FE->>MM: signMessage(address + username)
    MM->>U: Confirm signature
    U->>MM: Approve
    MM-->>FE: Return EIP-191 signature
    FE->>BE: POST /api/profiles {address, username, signature}
    BE->>BE: Recover signer, verify == address
    BE-->>FE: { success: true }
    FE->>FE: Cache name in localStorage
```

---

## Backend Architecture

The Node.js backend (`backend/server.js`) is a lightweight Express server providing two capabilities:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles` | Returns all registered `address → username` mappings |
| `POST` | `/api/profiles` | Registers a new mapping (requires EIP-191 signature) |
| `GET` | `/api/config` | Returns `contractAddress` and `chainId` for the frontend |

Persistent state is stored in `backend/data/profiles.json` and `backend/data/contract-address.json`.

---

## Design Decisions

### Why Admin-Resolved Outcomes?

Chainlink oracles add complexity and cost on testnet. An admin-resolved model is simpler, fully transparent via events, and sufficient for a World Cup demo. The `setAdmin()` function allows migrating the admin role to a Gnosis Safe multisig for a production deployment.

### Why P2P Instead of a Pool?

P2P matching is fairer (exact stake symmetry between two opposing bettors) and avoids liquidity management complexity. It is also easier to reason about in an audit context.

### Why X Layer Testnet?

X Layer (OKX's EVM-compatible chain) provides sub-cent fees, fast finality, and an active DeFi ecosystem — ideal for a betting DApp requiring multiple on-chain interactions per session.

### Why ethers.js v6?

v6 ships with better TypeScript types and improved tree-shaking. The `BrowserProvider` API integrates cleanly with MetaMask's `window.ethereum`.

---

## Gas Reference

| Operation | Estimated Gas | ~OKB at 1 Gwei |
|-----------|--------------|----------------|
| Deploy | ~800,000 | ~0.0008 OKB |
| `createBet` | ~100,000 | ~0.0001 OKB |
| `joinBet` | ~80,000 | ~0.00008 OKB |
| `resolveBet` | ~120,000 | ~0.00012 OKB |
| `cancelBet` | ~60,000 | ~0.00006 OKB |
