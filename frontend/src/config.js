// X Layer devnet configuration (override via .env for deployment)
export const CONFIG = {
  RPC_URL: process.env.REACT_APP_RPC_URL || "https://testrpc.xlayer.tech",
  CHAIN_ID: Number(process.env.REACT_APP_CHAIN_ID || 1952),
  CHAIN_NAME: process.env.REACT_APP_CHAIN_NAME || "X Layer Testnet",
  EXPLORER_URL:
    process.env.REACT_APP_EXPLORER_URL ||
    "https://okx.com/explorer/xlayer-test",
  CONTRACT_ADDRESS: (process.env.REACT_APP_CONTRACT_ADDRESS || "").trim(),
};

// Shared Bet struct components used in getBet and getActiveBets
const BET_COMPONENTS = [
  { internalType: "uint256", name: "betId", type: "uint256" },
  { internalType: "string", name: "matchName", type: "string" },
  { internalType: "address", name: "teamABetter", type: "address" },
  { internalType: "address", name: "teamBBetter", type: "address" },
  { internalType: "uint256", name: "amount", type: "uint256" },
  { internalType: "enum MatchStake.BetStatus", name: "status", type: "uint8" },
  { internalType: "enum MatchStake.Outcome", name: "outcome", type: "uint8" },
  { internalType: "uint256", name: "createdAt", type: "uint256" },
  { internalType: "uint256", name: "resolvedAt", type: "uint256" },
  { internalType: "uint8", name: "creatorHomeGoals", type: "uint8" },
  { internalType: "uint8", name: "creatorAwayGoals", type: "uint8" },
  { internalType: "uint8", name: "joinerHomeGoals", type: "uint8" },
  { internalType: "uint8", name: "joinerAwayGoals", type: "uint8" },
  { internalType: "uint8", name: "actualHomeGoals", type: "uint8" },
  { internalType: "uint8", name: "actualAwayGoals", type: "uint8" },
];

// Contract ABI
export const MATCHSTAKE_ABI = [
  // ── createBet ────────────────────────────────────────────────────────────
  {
    inputs: [
      { internalType: "string", name: "matchName", type: "string" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint8", name: "homeGoals", type: "uint8" },
      { internalType: "uint8", name: "awayGoals", type: "uint8" },
    ],
    name: "createBet",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  // ── joinBet ──────────────────────────────────────────────────────────────
  {
    inputs: [
      { internalType: "uint256", name: "betId", type: "uint256" },
      { internalType: "uint8", name: "homeGoals", type: "uint8" },
      { internalType: "uint8", name: "awayGoals", type: "uint8" },
    ],
    name: "joinBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  // ── resolveBet ───────────────────────────────────────────────────────────
  {
    inputs: [
      { internalType: "uint256", name: "betId", type: "uint256" },
      { internalType: "uint8", name: "actualHome", type: "uint8" },
      { internalType: "uint8", name: "actualAway", type: "uint8" },
    ],
    name: "resolveBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ── cancelBet ────────────────────────────────────────────────────────────
  {
    inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
    name: "cancelBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ── getBet ───────────────────────────────────────────────────────────────
  {
    inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
    name: "getBet",
    outputs: [
      {
        components: BET_COMPONENTS,
        internalType: "struct MatchStake.Bet",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // ── getActiveBets ────────────────────────────────────────────────────────
  {
    inputs: [],
    name: "getActiveBets",
    outputs: [
      {
        components: BET_COMPONENTS,
        internalType: "struct MatchStake.Bet[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // ── admin (view) ─────────────────────────────────────────────────────────
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // ── setAdmin ─────────────────────────────────────────────────────────────
  {
    inputs: [{ internalType: "address", name: "newAdmin", type: "address" }],
    name: "setAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ── Events ───────────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "betId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "matchName",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "homeGoals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "awayGoals",
        type: "uint8",
      },
    ],
    name: "BetCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "betId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "joiner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "homeGoals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "awayGoals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum MatchStake.BetStatus",
        name: "status",
        type: "uint8",
      },
    ],
    name: "BetJoined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "betId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum MatchStake.Outcome",
        name: "outcome",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "winnings",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "actualHomeGoals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "actualAwayGoals",
        type: "uint8",
      },
    ],
    name: "BetResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "betId",
        type: "uint256",
      },
    ],
    name: "BetCancelled",
    type: "event",
  },
];
