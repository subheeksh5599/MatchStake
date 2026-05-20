import { ethers } from "ethers";
import { CONFIG } from "./config";

let resolvedAddress = (CONFIG.CONTRACT_ADDRESS || "").trim();

function applyDeploymentMeta(meta) {
  if (meta?.chainId) {
    CONFIG.CHAIN_ID = Number(meta.chainId);
  }
}

/**
 * Resolve MatchStake address: .env → public/contract-address.json → backend /api/config
 */
export async function resolveContractAddress() {
  const sources = [
    async () => {
      const res = await fetch("/contract-address.json", { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      const addr = String(data?.address || "").trim();
      if (!addr || !ethers.isAddress(addr)) return null;
      applyDeploymentMeta(data);
      return addr;
    },
    async () => {
      const base = (process.env.REACT_APP_API_URL || "http://localhost:3001").replace(
        /\/$/,
        ""
      );
      const res = await fetch(`${base}/api/config`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      const addr = String(data?.contractAddress || "").trim();
      if (!addr || !ethers.isAddress(addr)) return null;
      applyDeploymentMeta(data);
      return addr;
    },
  ];

  for (const load of sources) {
    try {
      const addr = await load();
      if (addr && ethers.isAddress(addr)) {
        resolvedAddress = addr;
        CONFIG.CONTRACT_ADDRESS = addr;
        return addr;
      }
    } catch (e) {
      console.warn("contractConfig:", e);
    }
  }

  const envAddr = (process.env.REACT_APP_CONTRACT_ADDRESS || "").trim();
  if (envAddr && ethers.isAddress(envAddr)) {
    resolvedAddress = envAddr;
    CONFIG.CONTRACT_ADDRESS = envAddr;
    return envAddr;
  }

  if (resolvedAddress && ethers.isAddress(resolvedAddress)) {
    CONFIG.CONTRACT_ADDRESS = resolvedAddress;
    return resolvedAddress;
  }

  return "";
}

export function getContractAddress() {
  return CONFIG.CONTRACT_ADDRESS || resolvedAddress || "";
}

export function isContractAddressConfigured() {
  const addr = getContractAddress();
  return Boolean(addr && ethers.isAddress(addr));
}
