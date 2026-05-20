# MatchStake - Complete Deployment Guide

## Prerequisites

1. **Node.js**: v16+ with npm
2. **MetaMask**: Installed and configured for X Layer testnet
3. **Test Tokens**: OKB tokens on X Layer testnet
4. **Private Key**: Your MetaMask private key (for deployment)

## Network Configuration

Add to MetaMask:
- **Network Name**: X Layer Testnet
- **RPC URL**: https://testrpc.xlayer.tech
- **Chain ID**: 195
- **Currency**: OKB
- **Block Explorer**: https://okx.com/explorer/xlayer-test

## Quick Start (Automated)

Run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

## Step-by-Step Manual Setup

### 1. Deploy Smart Contract

```bash
cd contracts
npm install
npm run compile
npm test
```

Create `.env`:
```
PRIVATE_KEY=your_private_key_here
```

Deploy:
```bash
npm run deploy:xlayer
```

Save the contract address from `deployment.json`.

### 2. Setup Frontend

```bash
cd ../frontend
npm install
```

### 3. Run Frontend

```bash
npm start
```

### 4. Test in Browser

1. Go to `http://localhost:3000`
2. Click "Connect MetaMask"
3. Approve X Layer network in MetaMask
4. Enter contract address from Step 1
5. Click "Initialize Contract"

## Testing Scenarios

### Scenario 1: Create and Join a Bet

**User A:**
1. Match name: "Brazil vs France"
2. Bet amount: 10
3. Click "Create Bet"

**User B (Different MetaMask account):**
1. Select the Brazil vs France bet
2. Bet amount: 10
3. Click "Join Bet"

**Bet Status**: ACTIVE

### Scenario 2: Resolve Bet

**Admin (or same user):**
1. Find the ACTIVE bet
2. Choose outcome:
   - "Team A Wins" → User A gets 20 OKB
   - "Team B Wins" → User B gets 20 OKB
   - "Draw" → Both get 10 OKB

**Bet Status**: RESOLVED

### Scenario 3: Cancel Pending Bet

**User A:**
1. Create a bet but don't join
2. Click "Cancel Bet"
3. User A gets refund

**Bet Status**: CANCELLED

## Testing with Multiple Wallets

### In Hardhat (Local Testing)

```bash
cd contracts
npm test
```

### In Browser (X Layer Testnet)

1. **First Account**: Open MetaMask normally
   - Create bet
   - Wait for second account to join

2. **Second Account**: Use Incognito Window
   - Go to http://localhost:3000
   - Connect different MetaMask account
   - Join the pending bet

3. **Admin Account**: (Use first account again)
   - Switch back to first window
   - Resolve the bet
   - Check both accounts received winnings

## Contract Verification

### Check Deployment

```bash
cat contracts/deployment.json
```

Expected output:
```json
{
  "network": "xlayer",
  "address": "0x...",
  "chainId": 195,
  "deployedAt": "2024-05-20T..."
}
```

### View on Explorer

Visit: `https://okx.com/explorer/xlayer-test/address/YOUR_CONTRACT_ADDRESS`

## Frontend Customization

### Update Contract Address

Edit `frontend/src/App.js` or use the interface to set it.

### Add More Matches

Modify the match list in `App.js` to include preset matches:
```javascript
const MATCH_TEMPLATES = [
  "Brazil vs France",
  "Argentina vs Germany",
  "Spain vs England",
  // Add more...
];
```

## Troubleshooting

### MetaMask Connection Issues

1. Clear MetaMask cache
2. Reset account: Settings > Advanced > Reset Account
3. Re-add X Layer network

### Contract Not Initializing

1. Verify contract address is correct
2. Check contract exists on explorer
3. Ensure correct network is selected

### Transactions Failing

1. Check gas price (should be low on testnet)
2. Verify account has OKB balance
3. Check amount format (OKB, not wei)

### Frontend Won't Load

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## Demo Flow

Record a 1-3 minute demo:

1. **00:00** - Intro: "MatchStake - P2P betting on X Layer"
2. **00:15** - Show contract on explorer
3. **00:30** - User A creates bet "Brazil vs France" for 10 OKB
4. **01:00** - Switch to User B (incognito window)
5. **01:15** - User B joins bet for 10 OKB
6. **01:45** - Show ACTIVE bet status
7. **02:00** - Click "Team A Wins" to resolve
8. **02:15** - Show User A received 20 OKB
9. **02:45** - Show BetResolved event on explorer

## Security Checklist

- [ ] Private key never committed to git
- [ ] .env file in .gitignore
- [ ] Contract tested on hardhat
- [ ] Contract deployed to testnet
- [ ] Frontend works with contract
- [ ] MetaMask connection works
- [ ] Bet creation works
- [ ] Bet joining works
- [ ] Bet resolution works
- [ ] Event logs visible in explorer

## Environment Variables

Create `.env` in `/contracts`:
```
PRIVATE_KEY=your_private_key_here
```

Never commit this file!

## Gas Estimates

Approximate gas usage:
- Deploy: ~800,000 gas
- Create Bet: ~100,000 gas
- Join Bet: ~100,000 gas
- Resolve Bet: ~150,000 gas

With 1 Gwei gas price (~0.000001 OKB per gas):
- Transaction cost: 0.1-0.15 OKB

## Support

### Faucet for Test Tokens

Visit: https://www.okx.com/xlayer/faucet

### X Layer Documentation

https://www.okx.com/xlayer/docs

### Contract Source

View deployed contract on:
https://okx.com/explorer/xlayer-test/address/CONTRACT_ADDRESS

## Next Steps

After successful demo:
1. Record video walkthrough
2. Post on X/Twitter
3. Tag @XLayerOfficial
4. Submit Google Form
5. Keep posting updates until May 28
