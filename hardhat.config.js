require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  mocha: {
    timeout: 400000,
  },
  networks: {
    hardhat: {
      accounts: {
        count: 500,
      },
    },
  },
};
