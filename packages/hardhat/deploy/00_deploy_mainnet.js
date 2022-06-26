// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deployer address: ", deployer.address)

  var uniRouterAddresses = {
    'rinkeby': '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // (uni)
  }

  var oneInchRouterAddresses = {
    'mainnet': '0x1111111254fb6c44bac0bed2854e76f90643097d',
    'polygon': '0x1111111254fb6c44bac0bed2854e76f90643097d',
    'optimism': '0x1111111254760f7ab3f16433eea9304126dcd199',
    'rinkeby': '0x0000000000000000000000000000000000000001' // does not exist
  };

  var sfHostAddresses = {
    'polygon': '0x3E14dC1b13c488a8d5D310918780c983bD5982E7',
    'optimism': '0x567c4B141ED61923967cA25Ef4906C8781069a10',
    'rinkeby': '0xeD5B5b32110c3Ded02a07c8b8e97513FAfb883B6'
  };

  var sfCfaV1Addresses = {
    'polygon': '0x6EeE6060f715257b970700bc2656De21dEdF074C',
    'optimism': '0xB0aABBA4B2783A72C52956CDEF62d438ecA2d7a1',
    'rinkeby': '0xF4C5310E51F6079F601a5fb7120bC72a70b96e2A'
  };

  var sfIdaV1Addresses = {
    'polygon': '0xB0aABBA4B2783A72C52956CDEF62d438ecA2d7a1',
    'optimism': '0xc4ce5118C3B20950ee288f086cb7FC166d222D4c',
    'rinkeby': '0x32E0ecb72C1dDD92B007405F8102c1556624264D'
  };

  var tokenInAddresses = {
    'mainnet': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    'polygon': '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
    'optimism': '0x4200000000000000000000000000000000000006', // WETH
    'rinkeby': '0xDf032Bc4B9dC2782Bb09352007D4C57B75160B15' // WETH
  };

  var superTokenInAddresses = {
    'polygon': '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
    'optimism': '​​0x4ac8bd1bdae47beef2d1c6aa62229509b962aa0d', // ETHX,
    'rinkeby': '0x0fa3561bbf4095ebbcd3bf85995dda55e3d16f95' // WETHx
  }

  var superTokenOutAddresses = {
    'polygon': '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
    'optimism': '0x7d342726b69c28d942ad8bfe6ac81b972349d524', // DAIx
    'rinkeby': '0xdb6ad3aff4c31b32327fecb110f30daf4c378b11' // DAIx
  }

  var tokenOutAddresses = {
    'mainnet': '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    'polygon': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
    'optimism': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
    'rinkeby': '0x0165b733e860b1674541BB7409f8a4743A564157' // DAI
  };

  var network = 'rinkeby';

  args = [sfHostAddresses[network],
  sfCfaV1Addresses[network],
  sfIdaV1Addresses[network],
  superTokenInAddresses[network],
  superTokenOutAddresses[network],
  uniRouterAddresses[network],
  oneInchRouterAddresses[network]]

  console.log('args: ', args);

  const StreamSwapDistributeFactory = await ethers.getContractFactory("StreamSwapDistribute");
  console.log('here in test');
  const streamSwapDistribute = await StreamSwapDistributeFactory.deploy(
    sfHostAddresses[network],
    sfCfaV1Addresses[network],
    sfIdaV1Addresses[network],
    superTokenInAddresses[network],
    superTokenOutAddresses[network],
    uniRouterAddresses[network],
    oneInchRouterAddresses[network],
    1000
  );

  console.log("StreamSwapDistribute address:", streamSwapDistribute.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
