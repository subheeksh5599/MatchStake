# MatchStake - P2P World Cup Betting DApp

A peer-to-peer betting application on X Layer blockchain where users can bet on World Cup match outcomes.

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
2. Enter a match name (e.g., "Brazil vs France")
3. Enter your bet amount in OKB
4. Click "Create Bet"

### Joining a Bet
1. Select a pending bet from the available bets list
2. Enter the same amount as the original bet
3. Click "Join Bet"

### Resolving a Bet
1. After the match ends, click one of:
   - "Team A Wins"
   - "Team B Wins"
   - "Draw"
2. The winner will receive both bets automatically

## 📝 Smart Contract Functions

### `createBet(matchName, amount)`
Creates a new pending bet. Only the creator can join with an opposing bet.

### `joinBet(betId)`
Joins an existing pending bet with the same amount, making it active.

### `resolveBet(betId, outcome)`
Admin-only function to resolve an active bet and distribute winnings.

### `cancelBet(betId)`
Creator can cancel a pending bet to reclaim their funds.

### `getActiveBets()`
Returns all pending and active bets.

### `getBet(betId)`
Returns details for a specific bet.

## 🧪 Testing

Run the Hardhat test suite:
```bash
cd contracts
npm test
```

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

## 📱 Demo Video

Create a demo showing:
1. Two MetaMask wallets connecting
2. User A creating a bet
3. User B joining the bet
4. Admin resolving the bet
5. Winner receiving funds

## 🎉 Features

- ✅ Peer-to-peer betting system
- ✅ Smart contract escrow
- ✅ Automatic winner payout
- ✅ MetaMask integration
- ✅ Real-time bet updates
- ✅ Active bet listing
- ✅ Bet cancellation (pending bets)
- ✅ Draw handling

## 📞 Support

For issues or questions:
1. Check test contracts for examples
2. Review contract ABI in `frontend/src/config.js`
3. Check MetaMask network settings

## 📄 License

MIT
