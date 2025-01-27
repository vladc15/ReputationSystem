require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");

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
      chainId: 31337,
    },
    // sepolia: {
    //   url: "https://sepolia.infura.io/v3/<ApiKey>", // "https://ethereum-sepolia-rpc.publicnode.com"
    //   accounts: ["PrivateKey1", "PrivateKey2"]
    // },
    localhost: {
      chainId: 31337,
      url: "http://127.0.0.1:8545",
    },
  },
  defaultNetwork: "hardhat",
};