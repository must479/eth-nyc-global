// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");
const { ERC20 } = require("./../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Caller address: ", deployer.address)

  const StreamSwapDistributeFactory = await ethers.getContractFactory("StreamSwapDistribute");
  const contract = await StreamSwapDistributeFactory.attach("0xdD0210e75c44AA7bbd58368ef865C45580955B83");
  const balance = await ethers.Contract("0x0fa3561bbf4095ebbcd3bf85995dda55e3d16f95", ERC20.abi, deployer).balanceOf("0xdD0210e75c44AA7bbd58368ef865C45580955B83");
  console.log('balance');
  console.log(balance);
  const txn = await contract.executeAction();

  console.log("StreamSwapDistribute txn:", txn);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
