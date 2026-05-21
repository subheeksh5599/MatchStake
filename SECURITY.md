# MatchStake — Security Model

> **Scope**: This is a testnet demonstration. The security model is intentionally simplified for a hackathon context. See the [Recommendations for Mainnet](#recommendations-for-mainnet) section before deploying with real value.

---

## Smart Contract Security

### What the Contract Enforces

| Property | Enforcement |
|----------|-------------|
| Funds stay in escrow | ETH is sent with `createBet`/`joinBet` and only released via `resolveBet`/`cancelBet` |
| Exact stake match required | `joinBet` reverts if `msg.value != bet.amount` |
| No self-betting | `require(msg.sender != bet.teamABetter)` |
| One joiner per bet | Requires `teamBBetter == address(0)` before joining |
| Only active bets resolved | `require(bet.status == BetStatus.ACTIVE)` |
| Only pending bets cancelled | `require(bet.status == BetStatus.PENDING)` |
| Restricted cancellation | Caller must be creator or admin |
| Admin-only resolution | `onlyAdmin` modifier on `resolveBet` |
| Transfer success required | All `.call{value}("")` results are checked with `require(success)` |

### Checks-Effects-Interactions (CEI)

All state mutations (`bet.status`, `bet.outcome`, `bet.resolvedAt`) happen **before** external ETH transfers in every function. This follows the CEI pattern and reduces reentrancy exposure.

### Admin Role

The `admin` address (set to the deployer at construction) is the **only** account that can call `resolveBet`. This is a **centralised trust assumption** that is acceptable for a hackathon but must be replaced for production.

The `setAdmin(address newAdmin)` function lets the current admin transfer the role — for example, to a Gnosis Safe multisig.

---

## Known Limitations

| # | Issue | Risk Level | Notes |
|---|-------|-----------|-------|
| 1 | Centralised admin resolution | Medium | Admin can resolve dishonestly; mitigate with multisig or oracle in production |
| 2 | No time-lock on stuck bets | Low | Funds locked indefinitely if admin disappears; add a `claimRefundAfter(duration)` function for production |
| 3 | `getActiveBets()` iterates all bets | Low | Gas grows linearly with bet count; acceptable at demo scale, use The Graph for production |
| 4 | No emergency pause | Low | Cannot halt the contract if a bug is found post-deployment; add OpenZeppelin `Pausable` for production |
| 5 | Draw path sends two transfers | Low | State is updated before both transfers (CEI), so cross-function reentrancy risk is minimal; add `ReentrancyGuard` for production |

---

## Environment & Key Security

- **Deployer private key** is stored only in `contracts/.env`, which is listed in `.gitignore`. **Never commit `.env`.**
- **Frontend** holds no secrets. The contract ABI and address are public by design.
- **Backend** stores only public display names. No private keys or wallet secrets are ever sent to or stored by the server.

---

## Profile Registry Security

The backend authenticates display-name registrations using **EIP-191 personal signed messages**:

1. The frontend builds a deterministic message:
   ```
   MatchStake profile registration
   Wallet: {address}
   Username: {username}
   ```
2. The user signs this in MetaMask (no ETH is sent).
3. The backend recovers the signer from the signature using `ethers.verifyMessage()` and confirms it equals the claimed wallet address.

This ensures no one can register a display name for a wallet they do not control, without requiring any secrets server-side.

---

## Wallet Interaction Security

The frontend (`web3.js`) includes several defensive checks:

- Verifies the connected chain ID matches `CONFIG.CHAIN_ID` before any contract interaction.
- Validates that a contract address is a real EVM address (`ethers.isAddress`) and has deployed bytecode (`getCode !== "0x"`) before calling any contract methods.
- Normalises all wallet errors into human-readable messages to avoid leaking raw revert strings.

---

## Recommendations for Mainnet

Before deploying MatchStake with real funds, address the following:

- [ ] Replace admin resolution with a decentralised oracle (e.g. Chainlink Any API or UMA Optimistic Oracle)
- [ ] Add OpenZeppelin `ReentrancyGuard` to `resolveBet` and `cancelBet`
- [ ] Add OpenZeppelin `Pausable` with a multisig owner via `Ownable`
- [ ] Add a `claimRefundAfter(uint256 deadline)` function so bettors can reclaim funds if admin is inactive
- [ ] Replace `getActiveBets()` loop with a Subgraph (The Graph) for scalability
- [ ] Commission a professional smart contract audit before mainnet launch
- [ ] Add rate limiting to the backend profile API
- [ ] Replace flat-file JSON storage in the backend with a production database

---

## Responsible Disclosure

This is a testnet application. If you find a security issue, please open a GitHub issue labelled `[SECURITY]` or reach out directly via X (@MatchStakeXL). Please do not post vulnerability details publicly until the issue is resolved.
