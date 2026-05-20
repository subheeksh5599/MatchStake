// X Layer devnet configuration (override via .env for deployment)
export const CONFIG = {
  RPC_URL: process.env.REACT_APP_RPC_URL || "https://testrpc.xlayer.tech",
  CHAIN_ID: Number(process.env.REACT_APP_CHAIN_ID || 1952),
  CHAIN_NAME: process.env.REACT_APP_CHAIN_NAME || "X Layer Testnet",
  EXPLORER_URL:
    process.env.REACT_APP_EXPLORER_URL || "https://okx.com/explorer/xlayer-test",
  CONTRACT_ADDRESS: (process.env.REACT_APP_CONTRACT_ADDRESS || "").trim(),
};

// Contract ABI - Core functions
export const MATCHSTAKE_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "matchName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "createBet",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "betId",
        type: "uint256",
      },
    ],
    name: "joinBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "betId",
        type: "uint256",
      },
      {
        internalType: "enum MatchStake.Outcome",
        name: "outcome",
        type: "uint8",
      },
    ],
    name: "resolveBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "betId",
        type: "uint256",
      },
    ],
    name: "cancelBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "betId",
        type: "uint256",
      },
    ],
    name: "getBet",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "enum MatchStake.BetStatus",
        name: "",
        type: "uint8",
      },
      {
        internalType: "enum MatchStake.Outcome",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveBets",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "betId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "matchName",
            type: "string",
          },
          {
            internalType: "address",
            name: "teamABetter",
            type: "address",
          },
          {
            internalType: "address",
            name: "teamBBetter",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "enum MatchStake.BetStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum MatchStake.Outcome",
            name: "outcome",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "resolvedAt",
            type: "uint256",
          },
        ],
        internalType: "struct MatchStake.Bet[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
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
    ],
    name: "BetResolved",
    type: "event",
  },
];
