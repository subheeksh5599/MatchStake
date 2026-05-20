import { ethers } from "ethers";

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:3001").replace(
  /\/$/,
  ""
);

export function buildProfileMessage(address, username) {
  return `MatchStake profile registration\nWallet: ${address.toLowerCase()}\nUsername: ${username}`;
}

export async function fetchAllProfiles() {
  const res = await fetch(`${API_BASE}/api/profiles`);
  if (!res.ok) {
    throw new Error("Could not load player names from server.");
  }
  const data = await res.json();
  return data.profiles || {};
}

export async function registerProfileOnServer(address, username) {
  if (!window.ethereum) {
    throw new Error("Connect MetaMask to publish your display name.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const connected = (await signer.getAddress()).toLowerCase();
  if (connected !== address.toLowerCase()) {
    throw new Error("Use the connected wallet to register this username.");
  }

  const message = buildProfileMessage(address, username);
  const signature = await signer.signMessage(message);

  const res = await fetch(`${API_BASE}/api/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, username, signature }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not register username.");
  }
  return data;
}
