# MatchStake — P2P World Cup Betting DApp

![Network](https://img.shields.io/badge/network-X%20Layer%20Testnet-blue)
![Chain ID](https://img.shields.io/badge/chain--id-195-informational)
![Solidity](https://img.shields.io/badge/solidity-0.8.24-363636)
![License](https://img.shields.io/badge/license-MIT-green)

A peer-to-peer betting application on X Layer blockchain where users can bet on World Cup match outcomes with **score predictions**. Funds are held in a smart contract escrow with **algorithmic winner determination** based on prediction accuracy.

## Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [How to Use](#-how-to-use)
- [Smart Contract Functions](#-smart-contract-functions)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Events](#-events)
- [Security Notes](#-security-notes)
- [Documentation](#-documentation)

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

### Demo Video
**⏰ Record before deadline (May 28, 23:59 UTC):**
1. Connect wallet → Create bet with score prediction
2. Switch accounts in MetaMask
3. Join bet with different score prediction
4. Admin resolves with actual score
5. Winner receives automatic payout

*Upload to YouTube/Loom and add link here before submission.*

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

### Resolving a Bet (Admin Only - MVP Limitation)
1. After the match ends, admin enters the actual final score
2. Contract calculates Manhattan distance for both predictions
3. Closest prediction wins the full pot (2x stake)
4. Equal distances result in a draw — both players refunded

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

## 🚀 Deployment

After deploying to X Layer testnet, update the frontend with the contract address:
1. Copy the contract address from `contracts/deployment.json`
2. In the frontend, enter it in the "Contract Setup" section

## 📊 Events

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

**Current limitation:** The `resolveBet()` function is admin-only, which creates a centralization point. This is a hackathon MVP limitation.

**Production path:** Replace admin resolution with:
- **Chainlink Sports Data Oracle** for automated, trustless match result feeds
- **Crowd-sourced attestation** where multiple validators must agree on results
- **Time-locked dispute mechanism** allowing challenges before final settlement

The core escrow and payout logic is fully decentralized — only the result input currently requires trust.

## 🎉 Features

### Core Betting Mechanics
- ✅ Peer-to-peer betting with smart contract escrow
- ✅ **Score prediction system** — closest prediction wins (Manhattan distance algorithm)
- ✅ Automatic winner payout (no manual transfers)
- ✅ Draw support — equal distance predictions refund both players
- ✅ Bet cancellation for pending bets

### Web3 Integration
- ✅ MetaMask wallet integration with auto network switching
- ✅ Real-time bet list updates via on-chain event listeners
- ✅ Contract address auto-resolved from deployment files or backend

### User Experience
- ✅ Live match schedule from TheSportsDB (with offline fallback)
- ✅ **Player display names** — register a username, signed by your wallet
- ✅ Anonymous labels for unregistered wallets (stable, wallet-derived)
- ✅ Backend profile registry with EIP-191 signature authentication

### Novel Differentiators
- 🎯 **Score prediction betting** — not just win/lose/draw, predict exact scores
- 🏆 **Manhattan distance algorithm** — fair, mathematical winner determination
- 👤 **Wallet-bound usernames** — social layer without compromising decentralization
- 📊 **Live match data integration** — real fixtures, not dummy data

## 📚 Documentation

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | System diagrams, data flows, design decisions |
| `SECURITY.md` | Threat model, known limitations, mainnet checklist |
| `DEPLOYMENT.md` | Step-by-step deploy + test guide |
| `DEMO_GUIDE.md` | How to record the submission demo video |
| `X_STRATEGY.md` | Twitter/X posting templates and schedule |
| `CHECKLIST.md` | Pre-submission task list |
| `QUICK_REFERENCE.md` | Commands, troubleshooting, test scenarios |
| `CONTRIBUTING.md` | How to contribute to the project |
| `contracts/contracts/README.md` | Full contract function & event reference |

## 📞 Support

For issues or questions:
1. Check `QUICK_REFERENCE.md` for common fixes
2. Review contract ABI in `frontend/src/config.js`
3. Check MetaMask network settings (Chain ID must be 195)
4. See `ARCHITECTURE.md` for system-level context

## 🚀 Future Enhancements (Post-Hackathon)

### Decentralization
- **Chainlink Sports Data Oracle** — Replace admin resolution with automated, trustless result feeds
- **Multi-signature resolution** — Require 3+ validators to agree on match results
- **Time-locked disputes** — Allow 24-hour challenge period before final settlement

### Novel Features
- **NFT-gated premium bets** — Exclusive high-stakes rooms for NFT holders
- **Social wager sharing** — Share your open bets on Twitter/Farcaster to find opponents
- **Prediction leaderboard** — Track most accurate predictors across all matches
- **AI-suggested odds** — Machine learning model suggests fair odds based on team stats
- **Parlay bets** — Combine multiple match predictions for higher payouts
- **Live betting** — In-game score predictions with dynamic odds

### Technical Improvements
- **Layer 2 gas optimization** — Batch bet resolutions to reduce costs
- **IPFS metadata storage** — Store match details and predictions off-chain
- **Mobile app** — Native iOS/Android with WalletConnect integration

## 📄 License

MIT
