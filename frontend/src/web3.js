import { ethers } from "ethers";
import { CONFIG, MATCHSTAKE_ABI } from "./config";
import { getContractAddress, resolveContractAddress } from "./contractConfig";

let provider;
let signer;
let contract;

const normalizeWeb3Error = (error) => {
  const message = error?.reason || error?.shortMessage || error?.message || "Unknown error";
  const lowered = message.toLowerCase();

  if (lowered.includes("missing revert data") || lowered.includes("call exception")) {
    return "This address is not a compatible MatchStake contract on the selected network.";
  }
  if (lowered.includes("network")) {
    return "Please switch MetaMask to the configured network and try again.";
  }
  if (lowered.includes("user rejected")) {
    return "Request was rejected in wallet.";
  }
  if (lowered.includes("only admin")) {
    return "Only the contract admin can resolve stakes.";
  }

  return message;
};

export const ensureContractConfigured = async () => {
  const addr = await resolveContractAddress();
  if (!addr) {
    throw new Error(
      "MatchStake contract is not deployed yet. Run: cd contracts && npm run deploy:xlayer"
    );
  }
  return addr;
};

export const switchNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + CONFIG.CHAIN_ID.toString(16) }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x" + CONFIG.CHAIN_ID.toString(16),
            chainName: CONFIG.CHAIN_NAME,
            rpcUrls: [CONFIG.RPC_URL],
            blockExplorerUrls: [CONFIG.EXPLORER_URL],
            nativeCurrency: {
              name: "OKB",
              symbol: "OKB",
              decimals: 18,
            },
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
};

export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected");
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Get the network
    const networkData = await window.ethereum.request({
      method: "net_version",
    });

    if (parseInt(networkData) !== CONFIG.CHAIN_ID) {
      // Try to switch network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x" + CONFIG.CHAIN_ID.toString(16) }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          // Network not added, try to add it
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x" + CONFIG.CHAIN_ID.toString(16),
                chainName: CONFIG.CHAIN_NAME,
                rpcUrls: [CONFIG.RPC_URL],
                blockExplorerUrls: [CONFIG.EXPLORER_URL],
                nativeCurrency: {
                  name: "OKB",
                  symbol: "OKB",
                  decimals: 18,
                },
              },
            ],
          });
        }
      }
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const userAddress = accounts[0];

    const addr = await ensureContractConfigured();
    try {
      await initContract(addr);
    } catch (e) {
      console.warn("Auto contract init after connect:", e);
    }

    return userAddress;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

export const initContract = async (contractAddress) => {
  if (!signer) {
    throw new Error("Wallet not connected");
  }

  const trimmedAddress = contractAddress?.trim();
  if (!ethers.isAddress(trimmedAddress)) {
    throw new Error("Please enter a valid EVM address.");
  }

  try {
    const code = await getProvider().getCode(trimmedAddress);
    if (!code || code === "0x") {
      throw new Error("Address is valid but no contract is deployed at this address.");
    }

    const nextContract = new ethers.Contract(trimmedAddress, MATCHSTAKE_ABI, signer);
    await nextContract.getActiveBets();

    CONFIG.CONTRACT_ADDRESS = trimmedAddress;
    contract = nextContract;
    return contract;
  } catch (error) {
    throw new Error(normalizeWeb3Error(error));
  }
};

export const getContract = () => {
  if (!contract) {
    const contractAddr = getContractAddress();
    if (signer && contractAddr && ethers.isAddress(contractAddr)) {
      try {
        contract = new ethers.Contract(
          contractAddr,
          MATCHSTAKE_ABI,
          signer
        );
        console.log("On-demand contract initialization succeeded!");
        return contract;
      } catch (e) {
        console.error("On-demand contract init failed:", e);
      }
    }
    throw new Error("Contract not initialized");
  }
  return contract;
};

export const getSigner = () => {
  if (!signer) {
    throw new Error("Wallet not connected");
  }
  return signer;
};

export const getProvider = () => {
  if (!provider) {
    throw new Error("Provider not initialized");
  }
  return provider;
};

/**
 * Restore provider/signer when the wallet was already authorized (eth_accounts)
 * without running the full connect flow again.
 */
export const attachExistingSession = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  try {
    const addr = await ensureContractConfigured();
    await initContract(addr);
  } catch (e) {
    console.warn("Auto contract init on session restore:", e);
  }
};

/**
 * Returns chain id from the wallet (decimal) and whether bytecode exists at the configured contract.
 */
export const verifyXLayerAndContract = async () => {
  if (!window.ethereum) {
    return {
      chainId: null,
      chainOk: false,
      contractDeployed: false,
      contractInterfaceOk: false,
      contractInterfaceError: "",
    };
  }
  const hex = await window.ethereum.request({ method: "eth_chainId" });
  const chainId = parseInt(hex, 16);
  const chainOk = chainId === CONFIG.CHAIN_ID;

  let contractDeployed = false;
  let contractInterfaceOk = false;
  let contractInterfaceError = "";

  const contractAddr = getContractAddress();
  if (contractAddr && ethers.isAddress(contractAddr)) {
    try {
      const readProvider = new ethers.BrowserProvider(window.ethereum);
      const code = await readProvider.getCode(contractAddr);
      contractDeployed = Boolean(code && code !== "0x");
      if (contractDeployed && MATCHSTAKE_ABI?.length) {
        const probe = new ethers.Contract(
          contractAddr,
          MATCHSTAKE_ABI,
          readProvider
        );
        try {
          await probe.getActiveBets();
          contractInterfaceOk = true;
        } catch (callErr) {
          console.warn("probe getActiveBets failed:", callErr);
          contractInterfaceError = callErr.message || String(callErr);
        }

        if (chainOk && signer) {
          if (!contract) {
            contract = new ethers.Contract(
              contractAddr,
              MATCHSTAKE_ABI,
              signer
            );
            console.log("Automatically initialized contract with signer during verification!");
          }
        } else {
          contract = null;
        }
      } else {
        contract = null;
      }
    } catch (e) {
      console.warn("verifyXLayerAndContract:", e);
      contractInterfaceError = e.message || String(e);
      contract = null;
    }
  } else {
    contract = null;
  }

  return { chainId, chainOk, contractDeployed, contractInterfaceOk, contractInterfaceError };
};

export const getContractAdmin = async () => {
  const contract = getContract();
  return await contract.admin();
};

export const createBet = async (matchName, amountInOKB) => {
  try {
    const contract = getContract();
    const amount = Number(amountInOKB);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Stake amount must be greater than 0.");
    }
    const amountInWei = ethers.parseEther(amountInOKB.toString());

    const tx = await contract.createBet(matchName, amountInWei, {
      value: amountInWei,
    });

    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error creating bet:", error);
    throw new Error(normalizeWeb3Error(error));
  }
};

export const joinBet = async (betId, amountInOKB, requiredWei) => {
  try {
    const contract = getContract();
    const amount = Number(amountInOKB);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Stake amount must be greater than 0.");
    }
    const amountInWei = ethers.parseEther(amountInOKB.toString());
    if (requiredWei != null) {
      const required = ethers.getBigInt(requiredWei);
      if (amountInWei !== required) {
        throw new Error("You must match the opener's stake amount exactly.");
      }
    }

    const tx = await contract.joinBet(betId, {
      value: amountInWei,
    });

    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error joining bet:", error);
    throw new Error(normalizeWeb3Error(error));
  }
};

export const resolveBet = async (betId, outcome) => {
  try {
    const contract = getContract();
    const tx = await contract.resolveBet(betId, outcome);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error resolving bet:", error);
    throw new Error(normalizeWeb3Error(error));
  }
};

export const cancelBet = async (betId) => {
  try {
    const contract = getContract();
    const tx = await contract.cancelBet(betId);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error cancelling bet:", error);
    throw new Error(normalizeWeb3Error(error));
  }
};

export const getBet = async (betId) => {
  try {
    const contract = getContract();
    const bet = await contract.getBet(betId);
    return bet;
  } catch (error) {
    console.error("Error getting bet:", error);
    throw error;
  }
};

const normalizeBet = (bet) => ({
  betId: bet.betId,
  matchName: bet.matchName,
  teamABetter: bet.teamABetter,
  teamBBetter: bet.teamBBetter,
  amount: bet.amount,
  status: Number(bet.status),
  outcome: Number(bet.outcome),
  createdAt: bet.createdAt,
  resolvedAt: bet.resolvedAt,
});

export const getActiveBets = async () => {
  try {
    const contract = getContract();
    const bets = await contract.getActiveBets();
    return bets.map(normalizeBet);
  } catch (error) {
    console.error("Error getting active bets:", error);
    throw error;
  }
};

export const getBalance = async () => {
  try {
    const provider = getProvider();
    const signer = getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

export const getWalletAddress = async () => {
  try {
    const signer = getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error("Error getting wallet address:", error);
    throw error;
  }
};

export const listenToEvents = (contractAddress, callback) => {
  const contract = new ethers.Contract(
    contractAddress,
    MATCHSTAKE_ABI,
    getProvider()
  );

  contract.on("BetCreated", (betId, matchName, creator, amount, event) => {
    callback({
      type: "BetCreated",
      betId: betId.toString(),
      matchName,
      creator,
      amount: ethers.formatEther(amount),
    });
  });

  contract.on("BetJoined", (betId, joiner, status, event) => {
    callback({
      type: "BetJoined",
      betId: betId.toString(),
      joiner,
      status: status.toString(),
    });
  });

  contract.on("BetResolved", (betId, outcome, winner, winnings, event) => {
    callback({
      type: "BetResolved",
      betId: betId.toString(),
      outcome: outcome.toString(),
      winner,
      winnings: ethers.formatEther(winnings),
    });
  });
};
