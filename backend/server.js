const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const PROFILES_PATH = path.join(DATA_DIR, "profiles.json");
const CONTRACT_PATH = path.join(DATA_DIR, "contract-address.json");

function readProfiles() {
  try {
    if (!fs.existsSync(PROFILES_PATH)) return {};
    return JSON.parse(fs.readFileSync(PROFILES_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeProfiles(profiles) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROFILES_PATH, JSON.stringify(profiles, null, 2));
}

// ── GET /api/profiles ────────────────────────────────────────────────────────
// Returns all registered address → username mappings.
app.get("/api/profiles", (req, res) => {
  res.json({ profiles: readProfiles() });
});

// ── POST /api/profiles ───────────────────────────────────────────────────────
// Registers a display name. Requires an EIP-191 signature to prove wallet ownership.
app.post("/api/profiles", async (req, res) => {
  try {
    const { address, username, signature } = req.body || {};

    if (!address || !username || !signature) {
      return res.status(400).json({ error: "address, username and signature are required." });
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address format." });
    }
    if (!/^[a-zA-Z0-9_]{2,24}$/.test(username)) {
      return res.status(400).json({ error: "Username must be 2–24 characters (letters, numbers, underscore)." });
    }

    // Reconstruct exactly the message the frontend signed
    const message = `MatchStake profile registration\nWallet: ${address.toLowerCase()}\nUsername: ${username}`;

    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Signature does not match address." });
    }

    const profiles = readProfiles();
    profiles[address.toLowerCase()] = username;
    writeProfiles(profiles);

    console.log(`Registered: ${address.toLowerCase()} → ${username}`);
    res.json({ success: true, address: address.toLowerCase(), username });
  } catch (err) {
    console.error("POST /api/profiles:", err.message);
    res.status(500).json({ error: "Server error." });
  }
});

// ── GET /api/config ──────────────────────────────────────────────────────────
// Returns the deployed contract address so the frontend can auto-load it.
app.get("/api/config", (req, res) => {
  try {
    if (!fs.existsSync(CONTRACT_PATH)) {
      return res.status(404).json({ error: "Contract not deployed yet. Run: cd contracts && npm run deploy:xlayer" });
    }
    const data = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
    res.json({
      contractAddress: data.address || "",
      chainId: Number(data.chainId || 1952),
      network: data.network || "xlayer",
    });
  } catch (err) {
    console.error("GET /api/config:", err.message);
    res.status(500).json({ error: "Could not read contract config." });
  }
});

app.listen(PORT, () => {
  console.log(`MatchStake backend → http://localhost:${PORT}`);
  console.log(`  Profiles : ${PROFILES_PATH}`);
  console.log(`  Contract : ${CONTRACT_PATH}`);
});
