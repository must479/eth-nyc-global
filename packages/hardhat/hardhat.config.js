require("@nomiclabs/hardhat-waffle");
require('hardhat-erc1820');
require('hardhat-dependency-compiler');

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

module.exports = {
    solidity: {
        version: '0.8.13',
        settings: {
            optimizer: {
                enabled: true
            }
        }
    },
	dependencyCompiler: {
		paths: [
		  '@superfluid-finance/ethereum-contracts/contracts/agreements/InstantDistributionAgreementV1.sol',
		],
  },
  networks: {
    "rinkeby": {
     url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
     blockGasLimit: 100000000429720,
     accounts: [
       `${RINKEBY_PRIVATE_KEY}`,
      ]
    },
    "optimism-kovan": {
      url: `https://opt-kovan.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      blockGasLimit: 100000000429720,
      accounts: [
        `${RINKEBY_PRIVATE_KEY}`,
       ]
    },
    "polygon-mumbai": {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      blockGasLimit: 100000000429720,
      accounts: [
        `${RINKEBY_PRIVATE_KEY}`,
       ]
    }
  }
}
