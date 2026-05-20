# MatchStake - Quick Reference Guide

## 🚀 Essential Commands

### Smart Contract Setup
```bash
# Install dependencies
cd contracts
npm install

# Compile contracts
npm run compile

# Run all tests
npm test

# Deploy to X Layer
npm run deploy:xlayer

# View deployment info
cat deployment.json
```

### Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

### Automation
```bash
# Run full setup and tests
chmod +x setup.sh
./setup.sh
```

## 🔗 Network Configuration

### MetaMask Setup
- **Network Name**: X Layer Testnet
- **RPC URL**: https://testrpc.xlayer.tech
- **Chain ID**: 195
- **Currency**: OKB
- **Explorer**: https://okx.com/explorer/xlayer-test

### Add Network to MetaMask (Manual)
1. Click network selector (top left)
2. Click "Add Network"
3. Fill in details above
4. Save

## 📝 Key Files

| File | Purpose |
|------|---------|
| contracts/MatchStake.sol | Smart contract |
| contracts/test/MatchStake.test.js | Unit tests |
| contracts/scripts/deploy.js | Deploy script |
| frontend/src/App.js | Main React component |
| frontend/src/web3.js | Web3 utilities |
| frontend/src/config.js | Contract ABI & config |

## 💡 Common Issues

### MetaMask Won't Connect
```
Solution:
1. Clear MetaMask cache
2. Reset account (Settings > Advanced > Reset Account)
3. Re-add X Layer network
4. Refresh page
5. Try again
```

### Contract Address Invalid
```
Solution:
1. Check deployment.json for correct address
2. Verify network is X Layer (Chain ID: 195)
3. Check address on explorer
4. Ensure checksum is correct
```

### Transactions Failing
```
Solution:
1. Check gas price (should be low on testnet)
2. Verify account balance ≥ gas + amount
3. Check amount format (OKB not wei)
4. Retry if network congestion
```

### Frontend Won't Load
```
Solution:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## 🔐 Environment Variables

Create `contracts/.env`:
```
PRIVATE_KEY=your_private_key_here
```

Never commit this file!

## 📊 Contract Functions Reference

### Creating a Bet
```javascript
await matchStake.createBet("Brazil vs France", ethers.parseEther("10"), {
  value: ethers.parseEther("10")
})
```

### Joining a Bet
```javascript
await matchStake.joinBet(betId, {
  value: ethers.parseEther("10")
})
```

### Resolving a Bet
```javascript
// 1 = TEAM_A, 2 = TEAM_B, 3 = DRAW
await matchStake.resolveBet(betId, 1)
```

### Getting Active Bets
```javascript
const bets = await matchStake.getActiveBets()
```

### Cancelling a Bet
```javascript
await matchStake.cancelBet(betId)
```

## 🎥 Recording Demo

### Quick Demo Checklist
1. ⚪ Show contract on explorer
2. ⚪ User A creates bet (Brazil vs France, 10 OKB)
3. ⚪ User B joins bet (10 OKB)
4. ⚪ Show ACTIVE bet status
5. ⚪ Admin clicks "Team A Wins"
6. ⚪ Show transaction confirmed
7. ⚪ Show bet RESOLVED
8. ⚪ Show winner got 20 OKB

**Target**: Under 3 minutes

## 🐦 X/Twitter Template

```
🚀 MatchStake - Live on X Layer!

⚽ Create match bets
🤝 Opponent joins
💰 Winner gets all

Demo: [VIDEO_LINK]
Contract: [ADDRESS]

@XLayerOfficial #BuildOnXLayer
```

## 📱 Test Scenarios

### Scenario 1: Create → Join → Resolve
```
1. User A: Creates "Brazil vs France", 10 OKB
2. User B: Joins with 10 OKB
3. Admin: Resolves as TEAM_A
4. Result: User A gets 20 OKB
```

### Scenario 2: Multiple Bets
```
1. Create 3 different match bets
2. User A joins first two
3. User B joins third
4. Show all on active bets list
```

### Scenario 3: Draw Handling
```
1. Create bet
2. Opponent joins
3. Resolve as DRAW
4. Both users get their original amount back
```

## 🔍 Verification Steps

### Is Contract Deployed?
```bash
curl https://okx.com/explorer/xlayer-test/api/v1/address/CONTRACT_ADDRESS
```

### Did I Deploy Code?
```bash
cd contracts
cat deployment.json
# Should show address, network: xlayer, chainId: 195
```

### Is Frontend Connected?
1. Open http://localhost:3000
2. Click "Connect MetaMask"
3. Enter contract address
4. Create test bet
5. If works → Frontend OK

## 📞 Support Resources

- **X Layer Docs**: https://www.okx.com/xlayer/docs
- **Hardhat Docs**: https://hardhat.org
- **ethers.js Docs**: https://docs.ethers.org
- **Solidity Docs**: https://docs.soliditylang.org
- **MetaMask Help**: https://support.metamask.io

## ✅ Pre-Submission Checklist

Before May 28:
- [ ] Contract deployed to X Layer
- [ ] Tests passing
- [ ] Frontend works with contract
- [ ] Demo video recorded and uploaded
- [ ] X account created and active
- [ ] Posted at least 5 updates
- [ ] All posts tag @XLayerOfficial
- [ ] GitHub repo ready
- [ ] Google Form filled out

## 🎯 Success Indicators

✅ Contract shows on X Layer explorer
✅ Frontend connects without errors
✅ Can create, join, and resolve bets
✅ Demo video shows full flow
✅ X account has multiple posts
✅ Community engagement happening
✅ Code is clean and documented

## 🚀 Performance Tips

- Deploy during low network congestion
- Test locally with Hardhat first
- Use testnet OKB (free from faucet)
- Keep demo under 3 minutes
- Post on X/Twitter during peak hours
- Engage with other X Layer projects

---

**Quick Commands Reference**:
```bash
# Deploy everything
cd stake
./setup.sh

# Just deploy contract
cd contracts && npm run deploy:xlayer

# Just run frontend
cd frontend && npm start

# Just run tests
cd contracts && npm test
```

---

*Last updated: May 20, 2026*
*Deadline: May 28, 2026*
