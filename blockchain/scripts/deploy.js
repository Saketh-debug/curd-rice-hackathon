const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("============================================================");
  console.log("  Deploying DecisionAuditLedger to Hardhat Localnet");
  console.log("============================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer account:", deployer.address);

  const DecisionAuditLedger = await hre.ethers.getContractFactory("DecisionAuditLedger");
  const ledger = await DecisionAuditLedger.deploy();
  await ledger.waitForDeployment();

  const contractAddress = await ledger.getAddress();
  console.log("\n>>> Smart Contract Deployed Successfully!");
  console.log(">>> Contract Address:", contractAddress);

  // Extract artifact ABI
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/DecisionAuditLedger.sol/DecisionAuditLedger.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const configData = {
    contractAddress: contractAddress,
    rpcUrl: "http://127.0.0.1:8545",
    chainId: 31337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  // Save config for backend & frontend
  const serverConfigPath = path.join(__dirname, "../../server/blockchain_config.json");
  fs.writeFileSync(serverConfigPath, JSON.stringify(configData, null, 2));
  console.log(">>> Configuration saved to:", serverConfigPath);

  console.log("============================================================\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
