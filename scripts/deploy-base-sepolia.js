const { ethers } = require("hardhat");

// This script is for Base Sepolia ONLY. Never run it against a real-value chain.
async function main() {
  const chain = await ethers.provider.getNetwork();
  if (chain.chainId !== 84532n) {
    throw new Error("Refusing deployment: expected Base Sepolia chainId 84532");
  }
  const [deployer] = await ethers.getSigners();
  if (!deployer) throw new Error("No testnet signer configured");

  const balance = await ethers.provider.getBalance(deployer.address);
  if (balance === 0n) {
    throw new Error("No Base Sepolia test ETH; get test ETH before deployment");
  }

  // Official ERC-4337 v0.7 EntryPoint address, NOT an owner-controlled mock.
  const entryPoint = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
  if ((await ethers.provider.getCode(entryPoint)) === "0x") {
    throw new Error("Official EntryPoint v0.7 not found at expected address");
  }

  console.log("Network: Base Sepolia (84532)");
  console.log("Deployment owner/test wallet:", deployer.address);

  const token = await ethers.deployContract("GASO", [deployer.address]);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("GASO token deployed:", tokenAddress);

  // TEST price: 1 ETH fee -> 1000 GASO units, entirely artificial.
  const paymaster = await ethers.deployContract("GASOPaymaster", [
    tokenAddress,
    deployer.address,
    entryPoint,
    ethers.parseEther("1000")
  ]);
  await paymaster.waitForDeployment();

  console.log("GASO Paymaster deployed:", await paymaster.getAddress());
  console.log("Testnet token explorer:", "https://sepolia.basescan.org/address/" + tokenAddress);
  console.log("Testnet Paymaster explorer:", "https://sepolia.basescan.org/address/" + await paymaster.getAddress());
  console.log("IMPORTANT: Paymaster is NOT funded/staked; no gas sponsorship works until funded and tested.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
