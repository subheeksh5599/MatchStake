const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const PORT = Number(process.env.PORT || 3001);
const DATA_FILE = path.join(__dirname, "data", "profiles.json");
const CONTRACT_FILE = path.join(__dirname, "data", "contract-address.json");

const app = express();
app.use(cors());
app.use(express.json());

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{2,24}$/;

const DEPLOYMENT_FILE = path.join(
  __dirname,
  "..",
  "contracts",
  "deployment.json"
);

async function readContractConfig() {
  const files = [CONTRACT_FILE, DEPLOYMENT_FILE];
  for (const file of files) {
    try {
      const raw = await fs.promises.readFile(file, "utf8");
      const parsed = JSON.parse(raw);
      const addr = String(parsed?.address || parsed?.contractAddress || "").trim();
      if (ADDRESS_RE.test(addr)) {
        return {
          contractAddress: addr,
          chainId: parsed?.chainId ?? 1952,
          network: parsed?.network || "xlayer",
        };
      }
    } catch (e) {
      if (e.code !== "ENOENT") console.warn("readContractConfig:", file, e.message);
    }
  }
  return { contractAddress: "", chainId: 1952, network: "xlayer" };
}

async function readProfiles() {
  try {
    const raw = await fs.promises.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    if (e.code === "ENOENT") return {};
    throw e;
  }
}

async function writeProfiles(profiles) {
  await fs.promises.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(profiles, null, 2));
}

function normalizeAddress(address) {
  return String(address || "").trim().toLowerCase();
}

function buildProfileMessage(address, username) {
  return `MatchStake profile registration\nWallet: ${normalizeAddress(address)}\nUsername: ${username}`;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "matchstake-profiles" });
});

app.get("/api/config", async (_req, res) => {
  try {
    const config = await readContractConfig();
    res.json(config);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not load config." });
  }
});

/** All wallet -> username (lowercase address keys) */
app.get("/api/profiles", async (_req, res) => {
  try {
    const profiles = await readProfiles();
    res.json({ profiles });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not load profiles." });
  }
});

app.get("/api/profiles/:address", async (req, res) => {
  const address = normalizeAddress(req.params.address);
  if (!ADDRESS_RE.test(address)) {
    return res.status(400).json({ error: "Invalid wallet address." });
  }
  try {
    const profiles = await readProfiles();
    const username = profiles[address];
    if (!username) {
      return res.status(404).json({ error: "Profile not found." });
    }
    res.json({ address, username });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not load profile." });
  }
});

/**
 * Register or update display name for a wallet.
 * Demo: no signature check (hackathon). One username per wallet; names must be unique.
 */
app.post("/api/profiles", async (req, res) => {
  const address = normalizeAddress(req.body?.address);
  const username = String(req.body?.username || "").trim();
  const signature = String(req.body?.signature || "").trim();

  if (!ADDRESS_RE.test(address)) {
    return res.status(400).json({ error: "Invalid wallet address." });
  }
  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({
      error: "Username must be 2–24 characters (letters, numbers, underscore).",
    });
  }
  if (!signature) {
    return res.status(401).json({
      error: "Wallet signature required. Connect MetaMask and save your name again.",
    });
  }

  try {
    const message = buildProfileMessage(address, username);
    const recovered = ethers.verifyMessage(message, signature).toLowerCase();
    if (recovered !== address) {
      return res.status(401).json({ error: "Signature does not match this wallet." });
    }
    const profiles = await readProfiles();

    const takenBy = Object.entries(profiles).find(
      ([addr, name]) =>
        addr !== address && name.toLowerCase() === username.toLowerCase()
    );
    if (takenBy) {
      return res.status(409).json({ error: "That username is already taken." });
    }

    profiles[address] = username;
    await writeProfiles(profiles);

    res.json({ address, username });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not save profile." });
  }
});

app.listen(PORT, () => {
  console.log(`MatchStake profile API listening on http://localhost:${PORT}`);
});
