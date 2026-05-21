# Contributing to MatchStake

Thanks for your interest! MatchStake is a hackathon project targeting the X Layer testnet. Contributions that improve reliability, UX, security, or documentation are welcome.

---

## Getting Started

### Prerequisites

- Node.js ≥ 16 and npm
- MetaMask browser extension
- OKB testnet tokens — free from the [X Layer faucet](https://www.okx.com/xlayer/faucet)

### Clone & Install

```bash
git clone https://github.com/your-org/matchstake.git
cd matchstake

# Contracts
cd contracts && npm install

# Frontend
cd ../frontend && npm install

# Backend (optional, for profile registry)
cd ../backend && npm install
```

---

## Development Workflow

### Smart Contracts

```bash
cd contracts

# Compile
npm run compile

# Run full test suite (local Hardhat network — no testnet tokens needed)
npm test

# Deploy to X Layer testnet (requires contracts/.env with PRIVATE_KEY)
npm run deploy:xlayer
```

All new contract features must have at least one Hardhat test. Tests live in `contracts/test/MatchStake.test.js`.

### Frontend

```bash
cd frontend

# Start dev server with hot reload
npm start        # http://localhost:3000

# Production build
npm run build
```

**Environment variables** (create `frontend/.env`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `REACT_APP_SPORTSDB_API_KEY` | `3` | TheSportsDB API key |
| `REACT_APP_SPORTSDB_LEAGUE_ID` | `4328` | League ID for match fixtures |
| `REACT_APP_API_URL` | `http://localhost:3001` | Backend profile API base URL |
| `REACT_APP_CONTRACT_ADDRESS` | _(none)_ | Fallback contract address |

### Backend

```bash
cd backend

# Start server (port 3001 by default)
npm start

# Development mode (auto-restart on file changes)
npm run dev
```

The backend exposes three endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles` | Fetch all registered `address → username` mappings |
| `POST` | `/api/profiles` | Register a display name (requires EIP-191 signature) |
| `GET` | `/api/config` | Return current `contractAddress` and `chainId` |

---

## Code Style

- **Solidity**: 4-space indentation. Add NatSpec `@notice` / `@param` / `@return` comments on all `public`/`external` functions.
- **JavaScript**: Follow the surrounding code style. Prefer `const`, arrow functions, and async/await.
- **CSS**: Extend `App.css` rather than adding inline styles. Use BEM-style class names.
- **Commits**: Short, imperative messages — e.g. `fix: handle draw payout edge case`, `feat: add bet history panel`.

---

## Testing Requirements

| Area | Requirement |
|------|-------------|
| Smart contract | Every new function needs at least one passing Hardhat test |
| Frontend | Manually test against the X Layer testnet contract before opening a PR |
| Backend | Test new endpoints with `curl` or Postman before opening a PR |

---

## Pull Request Process

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes and add or update tests.
3. Run `cd contracts && npm test` and confirm everything passes.
4. Open a PR against `main` describing **what** changed and **why**.
5. Link any related issues.

---

## Filing Issues

Use GitHub Issues. Please include:

- **Steps to reproduce**
- **Expected vs. actual behaviour**
- Browser and MetaMask version (for frontend issues)
- Network / contract address (for contract issues)

---

## Project Layout Reference

```
stake/
├── contracts/                 Smart contract (Solidity + Hardhat)
│   ├── contracts/MatchStake.sol
│   ├── test/MatchStake.test.js
│   └── scripts/deploy.js
├── frontend/                  React 18 + ethers.js v6
│   └── src/
│       ├── App.js             Root component
│       ├── web3.js            Wallet + contract helpers
│       ├── contractConfig.js  Address resolver
│       ├── matchesApi.js      TheSportsDB integration
│       ├── profileApi.js      Backend REST helpers
│       └── profileStorage.js  localStorage + anonymous labels
└── backend/                   Express profile registry
    ├── server.js
    └── data/
        ├── profiles.json
        └── contract-address.json
```

See `ARCHITECTURE.md` for full diagrams and design rationale.

---

## License

By contributing, you agree that your contributions will be released under the [MIT License](LICENSE).
