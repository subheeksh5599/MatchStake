# MatchStake — P2P World Cup Betting DApp

![Network](https://img.shields.io/badge/network-X%20Layer%20Testnet-blue)
![Chain ID](https://img.shields.io/badge/chain--id-195-informational)
![Solidity](https://img.shields.io/badge/solidity-0.8.24-363636)
![License](https://img.shields.io/badge/license-MIT-green)

A peer-to-peer betting application on X Layer blockchain where users can bet on World Cup match outcomes with **score predictions**. Funds are held in a smart contract escrow with **algorithmic winner determination** based on prediction accuracy.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [How to Use](#how-to-use)
- [Smart Contract Functions](#smart-contract-functions)
- [Testing](#testing)
- [Contract on X Layer Explorer](#contract-on-x-layer-explorer)
- [Events](#events)
- [Security Notes](#security-notes)
- [Decentralization Roadmap](#decentralization-roadmap)

## 🎯 Project Structure

```
stake/
├── contracts/          # Solidity smart contracts
│   ├── contracts/     # Contract source files
│   ├── test/          # Contract tests
│   ├── scripts/       # Deployment scripts
│   └── package.json   # Hardhat dependencies
└── frontend/          # React frontend
    ├── public/        # Static files
    ├── src/           # React components
    └── package.json   # Frontend dependencies
```

## 🔧 Tech Stack

- **Smart Contracts**: Solidity 0.8.24
- **Contract Framework**: Hardhat
- **Frontend**: React 18
- **Web3 Library**: ethers.js v6
- **Wallet**: MetaMask
- **Blockchain**: X Layer (Chain ID: 195)
- **RPC**: https://testrpc.xlayer.tech
- **Explorer**: https://okx.com/explorer/xlayer-test

## 📋 Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MetaMask extension installed
- OKB testnet tokens for gas fees

### 1. Smart Contract Setup

```bash
cd contracts
npm install
```

Create `.env` file with your private key:
```
PRIVATE_KEY=your_private_key_here
```

Compile contracts:
```bash
npm run compile
```

Run tests:
```bash
npm test
```

Deploy to X Layer testnet:
```bash
npm run deploy:xlayer
```

### 2. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

## 🎮 How to Use

### Creating a Bet
1. Connect your MetaMask wallet to X Layer testnet
2. Select a match from the live fixtures
3. Enter your score prediction (e.g., Home: 2, Away: 1)
4. Enter your bet amount in OKB
5. Click "Create stake"

### Joining a Bet
1. Select a match with open bets
2. Choose an open bet from the dropdown
3. Enter your own score prediction (can be different from creator's)
4. The amount is auto-filled to match the original bet
5. Click "Join stake"

### Resolving a Bet
1. After the match ends, admin enters the actual final score
2. Contract calculates Manhattan distance for both predictions
3. Closest prediction wins the full pot (2x stake)
4. Equal distances result in a draw — both players refunded

**Note:** Resolution is currently admin-only. See the Decentralization Roadmap section for planned improvements.

## 📝 Smart Contract Functions

### `createBet(matchName, amount, homeGoals, awayGoals)`
Creates a new pending bet with your score prediction. Locks your stake until someone joins or you cancel.

### `joinBet(betId, homeGoals, awayGoals)`
Joins an existing pending bet with the same amount and your own score prediction, making it active.

### `resolveBet(betId, actualHomeGoals, actualAwayGoals)`
Admin-only function to resolve an active bet by entering the actual final score. Winner is determined by Manhattan distance (closest prediction wins). Equal distances result in a draw with both players refunded.

### `cancelBet(betId)`
Creator or admin can cancel a pending bet to reclaim funds.

### `getActiveBets()`
Returns all pending and active bets.

### `getBet(betId)`
Returns details for a specific bet including predictions and actual scores.

## 🧪 Testing

Run the Hardhat test suite:
```bash
cd contracts
npm test
```

## 🔍 Contract on X Layer Explorer

- **Contract Address:** `0x85C2dB87F93827a057838b788D28B89dA4fD8c19`
- **Network:** X Layer Testnet (Chain ID: 1952)
- **Explorer:** [View on X Layer Testnet Explorer](https://www.okx.com/explorer/xlayer-test/address/0x85C2dB87F93827a057838b788D28B89dA4fD8c19)

## � Eventsm

The contract emits the following events:
- `BetCreated`: When a new bet is created
- `BetJoined`: When a user joins a bet
- `BetResolved`: When a bet is resolved with a winner
- `BetCancelled`: When a pending bet is cancelled

## 🔐 Security Notes

- This is a testnet application for demonstration
- Always test thoroughly before mainnet deployment
- Verify contract address before interactions
- Only use testnet tokens

## ⚠️ Decentralization Roadmap

The `resolveBet()` function is currently admin-only, creating a centralization point. This is an MVP limitation with a clear path to full decentralization:

**Planned improvements:**
- **Chainlink Sports Data Oracle** — Automated, trustless match result feeds
- **Crowd-sourced attestation** — Multiple validators must agree on results
- **Time-locked dispute mechanism** — Challenge period before final settlement

The core escrow and payout logic is fully decentralized. Only the result input currently requires a trusted party.

## 🎉 Features

### Core Betting Mechanics
- Peer-to-peer betting with smart contract escrow
- Score prediction system with Manhattan distance algorithm
- Automatic winner payout
- Draw support with equal distance refunds
- Bet cancellation for pending bets

### Web3 Integration
- MetaMask wallet integration with auto network switching
- Real-time bet list updates via on-chain event listeners
- Contract address auto-resolved from deployment files

### User Experience
- Live match schedule from TheSportsDB API with offline fallback
- Player display names with wallet-bound usernames
- Anonymous labels for unregistered wallets
- Backend profile registry with EIP-191 signature authentication

### Novel Differentiators
- Score prediction betting with exact score forecasts
- Manhattan distance algorithm for fair winner determination
- Wallet-bound usernames for social features
- Live match data from TheSportsDB API

## � License

MIT
