require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();

const networks = { hardhat: { chainId: 31337 } };
// No public-network wallet by default. ONLY enable if explicitly configured
// with a throwaway TESTNET wallet and an RPC endpoint.
if (process.env.BASE_SEPOLIA_RPC_URL && process.env.TESTNET_DEPLOYER_KEY) {
  networks.baseSepolia = {
    url: process.env.BASE_SEPOLIA_RPC_URL,
    accounts: [process.env.TESTNET_DEPLOYER_KEY],
    chainId: 84532
  };
}

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "cancun" }
  },
  networks
};
