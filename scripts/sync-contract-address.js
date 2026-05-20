#!/usr/bin/env node
/**
 * Copies address from contracts/deployment.json into frontend + backend config files.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const deploymentPath = path.join(root, "contracts", "deployment.json");

if (!fs.existsSync(deploymentPath)) {
  console.error("Missing contracts/deployment.json — run: cd contracts && npm run deploy:xlayer");
  process.exit(1);
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
const address = deployment.address;
if (!address) {
  console.error("deployment.json has no address field");
  process.exit(1);
}

const shared = {
  address,
  network: deployment.network || "xlayer",
  chainId: Number(deployment.chainId || 1952),
  deployedAt: deployment.deployedAt || new Date().toISOString(),
};

const targets = [
  path.join(root, "frontend", "public", "contract-address.json"),
  path.join(root, "backend", "data", "contract-address.json"),
];

for (const t of targets) {
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, JSON.stringify(shared, null, 2));
  console.log("Wrote", t);
}

const envPath = path.join(root, "frontend", ".env");
let envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
if (/REACT_APP_CONTRACT_ADDRESS=/.test(envText)) {
  envText = envText.replace(
    /REACT_APP_CONTRACT_ADDRESS=.*/,
    `REACT_APP_CONTRACT_ADDRESS=${address}`
  );
} else {
  envText += `\nREACT_APP_CONTRACT_ADDRESS=${address}\n`;
}
if (!/REACT_APP_CHAIN_ID=/.test(envText)) {
  envText += `REACT_APP_CHAIN_ID=1952\n`;
}
fs.writeFileSync(envPath, envText.trim() + "\n");
console.log("Updated frontend/.env");
console.log("Contract:", address);
