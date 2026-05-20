require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");

const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      if (key && val) {
        process.env[key] = val;
      }
    }
  }
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    xlayer: {
      url: "https://testrpc.xlayer.tech",
      chainId: 1952,
      accounts: process.env.PRIVATE_KEY 
        ? [process.env.PRIVATE_KEY.trim().startsWith("0x") ? process.env.PRIVATE_KEY.trim() : "0x" + process.env.PRIVATE_KEY.trim()] 
        : [],
      gasPrice: 1000000000, // 1 Gwei
    },
    hardhat: {
      chainId: 31337,
    },
  },
};
