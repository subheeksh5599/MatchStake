# MatchStake - Submission Checklist & Quick Start

**Deadline**: May 28, 2026

## 📋 Pre-Submission Checklist

### Smart Contract ✅
- [x] Solidity contract written and tested
- [x] Hardhat setup complete
- [x] Tests passing (npm test)
- [x] Contract compiles without errors
- [x] Deployment script ready
- [ ] **Deploy to X Layer testnet** (npm run deploy:xlayer)
- [ ] Contract address saved

### Frontend ✅
- [x] React app created
- [x] MetaMask integration working
- [x] ethers.js connected to contract
- [x] UI components built
- [x] Bet creation flow implemented
- [x] Bet joining flow implemented
- [x] Bet resolution flow implemented
- [ ] **Test locally (npm start)**
- [ ] Tested with MetaMask
- [ ] Tested with contract address

### Testing & Demo ✅
- [x] Contract tested with Hardhat
- [x] Unit tests passing
- [ ] **Record demo video (1-3 minutes)**
  - [ ] User A creates bet
  - [ ] User B joins bet
  - [ ] Admin resolves bet
  - [ ] Winner receives funds
  - [ ] All transactions visible on explorer
- [ ] Demo uploaded to YouTube
- [ ] Demo uploaded to Twitter

### X/Twitter Account ✅
- [ ] Account created: @MatchStakeXL
- [ ] Bio set up with X Layer tag
- [ ] Profile picture added
- [ ] Pinned tweet with demo link
- [ ] Posted Day 1: Announcement
- [ ] Posted Day 2-7: Technical posts
- [ ] All posts tag @XLayerOfficial
- [ ] Demo video shared
- [ ] Engagement and responses active

### Documentation ✅
- [x] README.md completed
- [x] DEPLOYMENT.md with instructions
- [x] DEMO_GUIDE.md created
- [x] X_STRATEGY.md created
- [x] Test cases documented
- [x] Setup instructions in README

### Submission ✅
- [ ] Google Form filled out (before May 28)
- [ ] Contract address verified on explorer
- [ ] Frontend URL provided (if hosted)
- [ ] GitHub repo link provided
- [ ] Demo video link included
- [ ] X account linked

## 🚀 Quick Start (5 Minutes)

### 1. Deploy Contract
```bash
cd contracts
npm install  # Already done
npm run compile
npm test
# Update .env with PRIVATE_KEY
npm run deploy:xlayer
# Copy contract address from deployment.json
```

### 2. Test Frontend
```bash
cd ../frontend
npm install  # Already done
npm start
# In browser: http://localhost:3000
# Connect MetaMask
# Enter contract address
# Create and join a test bet
```

### 3. Record Demo
- Follow DEMO_GUIDE.md
- Keep under 3 minutes
- Show both users and resolution
- Upload to YouTube

### 4. Post on X/Twitter
- Create @MatchStakeXL account
- Post demo and links
- Tag @XLayerOfficial
- Follow X_STRATEGY.md

## 📁 Project Files

```
stake/
├── README.md                  ← Main documentation
├── DEPLOYMENT.md              ← Step-by-step setup
├── DEMO_GUIDE.md              ← Video recording guide
├── X_STRATEGY.md              ← Twitter strategy
├── setup.sh                   ← Automated setup
│
├── contracts/
│   ├── contracts/
│   │   └── MatchStake.sol      ← Main contract
│   ├── test/
│   │   └── MatchStake.test.js  ← Tests
│   ├── scripts/
│   │   └── deploy.js           ← Deployment
│   ├── package.json
│   ├── hardhat.config.js
│   └── .env.example            ← Copy to .env
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js              ← Main component
    │   ├── App.css             ← Styling
    │   ├── index.js            ← Entry point
    │   ├── config.js           ← Contract ABI
    │   └── web3.js             ← Web3 utilities
    └── package.json
```

## 🔑 Key Files to Have Ready

Before submission, ensure you have:

1. **Contract Address** - From deployment.json
2. **Demo Video** - Recorded and uploaded
3. **Contract Verification** - On explorer
4. **Frontend Working** - Local or hosted
5. **X Account Active** - Multiple posts with demo
6. **GitHub Repo** - Link to code
7. **Google Form** - Filled before deadline

## 📊 Testing Checklist

Run these before submitting:

```bash
# Contract tests
cd contracts
npm test

# Check deployment
cat deployment.json

# View contract
curl https://okx.com/explorer/xlayer-test/api/v1/address/YOUR_ADDRESS

# Test frontend locally
cd ../frontend
npm start
# Connect MetaMask to X Layer testnet (Chain ID: 195)
# Enter contract address from deployment.json
# Create, join, and resolve a test bet
```

## 🎯 Day-by-Day Task Breakdown

### Today (Day 1)
- [ ] Deploy contract to X Layer testnet
- [ ] Test frontend with contract address
- [ ] Record demo video (rough cut OK)
- [ ] Create X/Twitter account
- [ ] Post announcement

### Day 2
- [ ] Edit and finalize demo video
- [ ] Upload to YouTube
- [ ] Post technical overview on X
- [ ] Share GitHub repo link

### Day 3
- [ ] Post demo teaser on X
- [ ] Share DEPLOYMENT.md instructions
- [ ] Test with multiple accounts

### Day 4
- [ ] Post full demo on X
- [ ] Engage with comments
- [ ] Share frontend link

### Day 5-7
- [ ] Daily X posts about features
- [ ] Share contract screenshots
- [ ] Engage with X Layer community
- [ ] Repost successful content

### Day 8+
- [ ] Continue daily engagement
- [ ] Update docs with learnings
- [ ] Prepare submission package
- [ ] Final push to May 28

## 📞 Before Submission

### Verify Everything Works

```bash
# 1. Check contract is live
curl https://okx.com/explorer/xlayer-test/api/v1/address/CONTRACT_ADDRESS

# 2. Check frontend can connect
# Manual: Open http://localhost:3000, connect wallet, initialize contract

# 3. Check X account has posts
# Manual: Visit @MatchStakeXL, verify posts with @XLayerOfficial tag

# 4. Verify GitHub repo
# Check: Contract code, tests, frontend, documentation
```

### Gather Submission Materials

- [ ] Contract address on X Layer testnet
- [ ] Contract ABI (in frontend/src/config.js)
- [ ] Demo video link (YouTube)
- [ ] X/Twitter account link (@MatchStakeXL)
- [ ] GitHub repository link
- [ ] Frontend deployment link (if applicable)
- [ ] Key features list
- [ ] Technical stack details

### Google Form Submission

When filling form, include:
- **Project Name**: MatchStake
- **Description**: P2P World Cup betting on X Layer
- **Contract Address**: [X Layer testnet address]
- **GitHub Link**: [Your GitHub repo]
- **Demo Video**: [YouTube link]
- **X Account**: @MatchStakeXL
- **Tech Stack**: Solidity, Hardhat, React, ethers.js

## ⚡ Network Details

For verification:
- **Network**: X Layer Testnet
- **Chain ID**: 195
- **RPC**: https://testrpc.xlayer.tech
- **Explorer**: https://okx.com/explorer/xlayer-test
- **Currency**: OKB
- **Faucet**: https://www.okx.com/xlayer/faucet

## 💾 Backup Important Files

Before submission:
1. Save deployment.json
2. Screenshot contract on explorer
3. Save demo video URL
4. Screenshot X posts
5. Backup GitHub repo link

## 🎉 Success Criteria

You'll know you're ready when:
✅ Contract deployed on X Layer testnet
✅ Frontend connects and works
✅ Demo video shows full betting flow
✅ X account has 5+ posts
✅ All tags include @XLayerOfficial
✅ GitHub repo is public and complete
✅ Documentation is clear and comprehensive

---

**Remember**: The deadline is May 28! Start with deployment today.

For questions or issues, refer to:
- DEPLOYMENT.md - Setup issues
- DEMO_GUIDE.md - Video recording
- X_STRATEGY.md - Social media
- Test files - Code examples
