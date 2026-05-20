const { ethers } = require("ethers");

async function main() {
  const rpcUrl = "https://testrpc.xlayer.tech";
  const contractAddress = "0x85C2dB87F93827a057838b788D28B89dA4fD8c19";

  console.log(`Probing RPC: ${rpcUrl}`);
  console.log(`Contract Address: ${contractAddress}`);

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    const code = await provider.getCode(contractAddress);
    console.log(`Bytecode length: ${code.length} bytes`);

    const abi = [
      {
        "inputs": [],
        "name": "getActiveBets",
        "outputs": [
          {
            "components": [
              { "internalType": "uint256", "name": "betId", "type": "uint256" },
              { "internalType": "string", "name": "matchName", "type": "string" },
              { "internalType": "address", "name": "teamABetter", "type": "address" },
              { "internalType": "address", "name": "teamBBetter", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" },
              { "internalType": "uint8", "name": "status", "type": "uint8" },
              { "internalType": "uint8", "name": "outcome", "type": "uint8" },
              { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
              { "internalType": "uint256", "name": "resolvedAt", "type": "uint256" }
            ],
            "internalType": "struct MatchStake.Bet[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    const contract = new ethers.Contract(contractAddress, abi, provider);
    console.log("Calling getActiveBets() with full 9-element ABI...");
    const bets = await contract.getActiveBets();
    console.log(`Success! Found ${bets.length} active bets.`);
  } catch (error) {
    console.error("ERROR PROBING CONTRACT:", error.message || error);
  }
}

main();
