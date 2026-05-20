#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}MatchStake Deployment Guide${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Setup Smart Contracts
echo -e "${YELLOW}Step 1: Setting up smart contracts...${NC}"
cd contracts

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Hardhat dependencies..."
    npm install
fi

# Compile contracts
echo "Compiling contracts..."
npm run compile

# Run tests
echo -e "\n${YELLOW}Step 2: Running contract tests...${NC}"
npm test

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "\n${YELLOW}⚠️  Please create .env file with your PRIVATE_KEY${NC}"
    echo "Example:"
    echo "PRIVATE_KEY=your_private_key_here"
    echo ""
    read -p "Press Enter after setting up .env..."
fi

# Deploy to X Layer
echo -e "\n${YELLOW}Step 3: Deploying to X Layer testnet...${NC}"
npm run deploy:xlayer

# Get deployed address
CONTRACT_ADDRESS=""
if [ -f "deployment.json" ]; then
    CONTRACT_ADDRESS=$(grep '"address"' deployment.json | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Contract deployed at: $CONTRACT_ADDRESS${NC}"
else
    echo -e "${YELLOW}⚠️  deployment.json not found${NC}"
fi

# Step 2: Setup Frontend
echo -e "\n${YELLOW}Step 4: Setting up frontend...${NC}"
cd ../frontend

if [ -n "$CONTRACT_ADDRESS" ]; then
    cat > .env <<EOF
REACT_APP_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SPORTSDB_API_KEY=3
REACT_APP_SPORTSDB_LEAGUE_ID=4328
EOF
    echo -e "${GREEN}✅ Wrote frontend/.env with contract address${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing React dependencies..."
    npm install
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"
echo -e "${BLUE}To run the demo:${NC}"
echo "  Terminal 1: cd backend && npm install && npm start"
echo "  Terminal 2: cd frontend && npm start"
echo ""
echo -e "${BLUE}Then:${NC}"
echo "  1. Pick a username (synced for all visitors via backend)"
echo "  2. Connect MetaMask to X Layer testnet"
echo "  3. Select a match and create or join a stake"
echo ""
