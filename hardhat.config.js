require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      gas: "auto",
      mining: {
          interval: 100, //ms
      },
      loggingEnabled: true,
      chainId: 1337,
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/<ApiKey>", // "https://ethereum-sepolia-rpc.publicnode.com"
      accounts: ["PrivateKey1", "PrivateKey2"]
    },
  },
  defaultNetwork: "hardhat",
};