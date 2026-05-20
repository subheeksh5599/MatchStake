# MatchStake Demo Video Guide

Create a 1-3 minute demo showing the complete betting flow.

## Setup Before Recording

1. Deploy contract to X Layer testnet
2. Have contract address ready
3. Open two browser windows/profiles:
   - Window 1: User A (first MetaMask account)
   - Window 2: User B (second MetaMask account or incognito)
4. Ensure both accounts have test OKB tokens
5. Have screen recording software ready (OBS, Loom, etc.)

## Demo Script

### Opening (0:00-0:15)

**Narration**: "MatchStake - Peer-to-peer World Cup betting on X Layer blockchain. Transparent, trustless, and instant settlements."

**Visual**:
- Show MatchStake title
- Display X Layer devnet details
- Show contract address on explorer

### User A Creates Bet (0:15-0:45)

**Narration**: "User A wants to bet on Brazil vs France. They create a bet for 10 OKB, wagering that Brazil will win."

**Visual**:
1. Show first MetaMask wallet address
2. Show balance (≥20 OKB)
3. Enter match name: "Brazil vs France"
4. Enter amount: 10
5. Click "Create Bet"
6. Show transaction in MetaMask
7. Approve transaction
8. Show success message
9. Show created bet in Active Bets section (PENDING status)

### User B Joins Bet (0:45-1:30)

**Narration**: "User B thinks France will win. They join the same bet with 10 OKB. Now both bets are in escrow on the smart contract."

**Visual**:
1. Switch to second window/profile
2. Show second MetaMask wallet address
3. Paste same contract address
4. Initialize contract
5. Show the PENDING "Brazil vs France" bet
6. Select the bet from dropdown
7. Enter amount: 10
8. Click "Join Bet"
9. Show transaction
10. Approve transaction
11. Show success message
12. Show bet status changed to ACTIVE
13. Show both users displayed (Team A and Team B)

### Resolve Bet (1:30-2:30)

**Narration**: "The World Cup match has ended. Brazil won 1-0. The admin (us) resolves the bet. The smart contract automatically sends the 20 OKB to User A."

**Visual**:
1. Go back to first window
2. Show the ACTIVE bet "Brazil vs France"
3. Click "Team A Wins" (Brazil)
4. Show transaction in MetaMask
5. Approve transaction
6. Show success message
7. Show bet status changed to RESOLVED
8. Show outcome: TEAM_A
9. **Switch to second window**
10. Refresh the page
11. Show bet is RESOLVED
12. Show winner is Team A (User A's address)

### Results (2:30-3:00)

**Narration**: "And that's it! The winner automatically received both bets - 20 OKB. All happening trustlessly on X Layer."

**Visual**:
1. Show User A's new balance (original + 20 OKB)
2. Open explorer
3. Show the contract address
4. Show the BetResolved transaction
5. Show event logs

## Recording Tips

### Quality
- **Resolution**: 1080p minimum
- **Frame Rate**: 30 fps minimum
- **Lighting**: Good desktop lighting
- **Audio**: Clear narration, no background noise

### Pacing
- Slow down clicks so viewers can follow
- Wait for transactions to complete before proceeding
- Show confirmation screens
- Point out important UI elements

### Content Checklist
- ✅ Show MetaMask connection
- ✅ Show contract address
- ✅ Show user balances
- ✅ Show bet creation (full flow)
- ✅ Show bet joining (full flow)
- ✅ Show bet resolution
- ✅ Show winner receives funds
- ✅ Show explorer/verification

## Recording Setup Options

### Option 1: OBS (Free)
```
1. Download OBS Studio
2. Add Display Capture or Window Capture
3. Add Audio source (microphone)
4. Start recording
5. Perform demo
6. Stop recording
7. Export as MP4
```

### Option 2: Loom (Browser)
```
1. Go to loom.com
2. Click "Start Recording"
3. Select window to record
4. Record demo
5. Share video link
```

### Option 3: QuickTime (Mac)
```
1. Open QuickTime
2. File > New Screen Recording
3. Record demo
4. Export as MP4
```

## Video Structure

```
OPENING (15 sec)
├─ Title
├─ What is MatchStake
└─ Network info

DEMO PART 1: CREATE (30 sec)
├─ User A account
├─ Match details
├─ Create bet
└─ Show pending bet

DEMO PART 2: JOIN (45 sec)
├─ User B account
├─ Select pending bet
├─ Join with amount
├─ Show active bet

DEMO PART 3: RESOLVE (45 sec)
├─ Select outcome
├─ Resolve bet
├─ Show winner
└─ Verify on explorer

CLOSING (15 sec)
├─ Summary
├─ Links
├─ Call to action
```

## Post-Recording

### Editing (Optional)
- Add intro music (royalty-free)
- Add captions/subtitles
- Highlight important parts
- Add X Layer logo

### Uploading
1. Save locally as MP4
2. Upload to YouTube
3. Upload to Twitter/X
4. Upload to TikTok
5. Share on Telegram, Discord

### File Format
- **Codec**: H.264
- **Resolution**: 1920x1080
- **Bitrate**: 5-10 Mbps
- **Format**: MP4

## Social Media Posts

### Post #1: Teaser (Before Demo)
```
🎬 MatchStake demo coming soon!

Peer-to-peer World Cup betting on X Layer:
⚽ Create a bet
🤝 Opponent joins
💰 Winner gets both

Full demo dropping soon - tag @XLayerOfficial

#XLayer #DeFi #Betting
```

### Post #2: Demo Release
```
🚀 MatchStake is LIVE on X Layer!

Demo: [LINK TO VIDEO]

How it works:
1️⃣ User A bets 10 OKB on Brazil
2️⃣ User B bets 10 OKB on France
3️⃣ Admin resolves → Winner gets 20 OKB

100% on-chain. Instant settlement. 

@XLayerOfficial #DeFi #BlockchainBetting
```

### Post #3: Technical Deep Dive
```
🔧 MatchStake Smart Contract Breakdown

✅ Escrow holding funds
✅ Automatic winner payout
✅ Draw support
✅ Event logging
✅ Admin resolution

Contract: [ADDRESS]
Explorer: [LINK]

Built with Solidity + Hardhat on @XLayerOfficial

#SmartContracts #Solidity
```

## Common Recording Mistakes

❌ Going too fast
❌ Not showing confirmations
❌ Unclear narration
❌ Poor audio quality
❌ Recording during network lag
❌ Not showing balances before/after

✅ Slow down
✅ Wait for state changes
✅ Speak clearly
✅ Use good microphone
✅ Test network connection
✅ Show account balance
