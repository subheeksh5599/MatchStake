const USERNAME_KEY = "matchstake_username";
const PROFILE_PREFIX = "matchstake_profile_";

export function getStoredUsername() {
  try {
    return localStorage.getItem(USERNAME_KEY) || "";
  } catch {
    return "";
  }
}

export function setStoredUsername(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return;
  try {
    localStorage.setItem(USERNAME_KEY, trimmed);
  } catch {
    /* ignore */
  }
}

export function bindUsernameToWallet(address, username) {
  if (!address || !username) return;
  try {
    localStorage.setItem(
      `${PROFILE_PREFIX}${address.toLowerCase()}`,
      username.trim()
    );
  } catch {
    /* ignore */
  }
}

export function getUsernameForWallet(address) {
  if (!address) return "";
  try {
    return (
      localStorage.getItem(`${PROFILE_PREFIX}${address.toLowerCase()}`) || ""
    );
  } catch {
    return "";
  }
}

const ADJECTIVES = [
  "Swift",
  "Bold",
  "Quiet",
  "Bright",
  "Calm",
  "Keen",
  "Wild",
  "Cool",
  "Brave",
  "Quick",
];

const NOUNS = [
  "Striker",
  "Keeper",
  "Midfielder",
  "Captain",
  "Rival",
  "Fan",
  "Scout",
  "Ref",
  "Coach",
  "Rookie",
];

/**
 * Stable friendly label for an address — never exposes raw hex.
 */
export function getPublicPlayerLabel(address) {
  if (!address || typeof address !== "string") return "Player";
  const lower = address.toLowerCase();
  let hash = 0;
  for (let i = 2; i < lower.length; i++) {
    hash = (hash * 31 + lower.charCodeAt(i)) >>> 0;
  }
  const adj = ADJECTIVES[hash % ADJECTIVES.length];
  const noun = NOUNS[(hash >> 4) % NOUNS.length];
  return `${adj} ${noun}`;
}

export function getDisplayNameForAddress(
  viewerAddress,
  targetAddress,
  myUsername,
  serverProfiles = {}
) {
  if (!targetAddress) return "Unknown";
  const t = targetAddress.toLowerCase();
  if (viewerAddress && t === viewerAddress.toLowerCase()) {
    return myUsername || "You";
  }
  if (serverProfiles[t]) return serverProfiles[t];
  const registered = getUsernameForWallet(targetAddress);
  if (registered) return registered;
  return getPublicPlayerLabel(targetAddress);
}
