const hre = require("hardhat");
const path = require("path");

async function main() {
  console.log("Deploying MatchStake contract...");

  const MatchStake = await hre.ethers.getContractFactory("MatchStake");
  const matchStake = await MatchStake.deploy();

  await matchStake.waitForDeployment();

  const address = await matchStake.getAddress();
  console.log("✅ MatchStake deployed to:", address);

  // Save deployment details
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    address: address,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  const shared = {
    address,
    network: deploymentInfo.network,
    chainId: Number(deploymentInfo.chainId),
    deployedAt: deploymentInfo.deployedAt,
  };

  const frontendPublic = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "public",
    "contract-address.json"
  );
  const backendData = path.join(
    __dirname,
    "..",
    "..",
    "backend",
    "data",
    "contract-address.json"
  );
  const frontendEnv = path.join(__dirname, "..", "..", "frontend", ".env");

  fs.mkdirSync(path.dirname(frontendPublic), { recursive: true });
  fs.mkdirSync(path.dirname(backendData), { recursive: true });
  fs.writeFileSync(frontendPublic, JSON.stringify(shared, null, 2));
  fs.writeFileSync(backendData, JSON.stringify(shared, null, 2));

  try {
    let envText = "";
    if (fs.existsSync(frontendEnv)) {
      envText = fs.readFileSync(frontendEnv, "utf8");
    }
    if (/REACT_APP_CONTRACT_ADDRESS=/.test(envText)) {
      envText = envText.replace(
        /REACT_APP_CONTRACT_ADDRESS=.*/,
        `REACT_APP_CONTRACT_ADDRESS=${address}`
      );
    } else {
      envText += `\nREACT_APP_CONTRACT_ADDRESS=${address}\n`;
    }
    fs.writeFileSync(frontendEnv, envText.trim() + "\n");
    console.log("Updated frontend/.env with contract address");
  } catch (e) {
    console.warn("Could not update frontend/.env:", e.message);
  }

  console.log("Deployment info saved to deployment.json, frontend/public, backend/data");

  // Verify on explorer if applicable
  if (hre.network.name === "xlayer") {
    console.log(
      "📍 View on explorer: https://okx.com/explorer/xlayer-test/address/" +
        address
    );
  }

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
