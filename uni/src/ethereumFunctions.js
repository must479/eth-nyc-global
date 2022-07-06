import { Contract, ethers } from "ethers";
import * as chains from "./constants/chains";
import COINS from "./constants/coins";
import { Framework } from "@superfluid-finance/sdk-core";
import WalletConnectProvider from "@walletconnect/web3-provider";

const ROUTER = require("./build/UniswapV2Router02.json");
const LONG_TERM_ROUTER = require("./build/StreamSwapDistribute.json");
const ERC20 = require("./build/ERC20.json");
const FACTORY = require("./build/IUniswapV2Factory.json");
const PAIR = require("./build/IUniswapV2Pair.json");

export async function getProvider() {
  // return new ethers.providers.Web3Provider(window.ethereum);
  // const provider = new WalletConnectProvider({
  //   infuraId: "1f133f7d01c843b3a97912e36847f6ca",
  // });

  //  Enable session (triggers QR Code modal)
  //await provider.enable();
  //const pro = new ethers.providers.Web3Provider(provider);
  const pro = new ethers.providers.Web3Provider(window.ethereum);
  return pro;
}

export function getSigner(provider) {
  return provider.getSigner();
}

export async function getNetwork(provider) {
  const network = await provider.getNetwork();
  return network.chainId;
}

export async function getSf(chainId) {
  const provider = await getProvider();
  const sf = await Framework.create({
    chainId: chainId,
    provider,
  });
  return sf;
}

export function getRouter(address, signer) {
  return new Contract(address, ROUTER.abi, signer);
}

export function getLongTermRouter(address, signer) {
  return new Contract(address, LONG_TERM_ROUTER.abi, signer);
}

export async function checkNetwork(provider) {
  const chainId = getNetwork(provider);
  if (chains.networks.includes(chainId)) {
    return true;
  }
  return false;
}

export function getWeth(address, signer) {
  return new Contract(address, ERC20.abi, signer);
}

export function getFactory(address, signer) {
  return new Contract(address, FACTORY.abi, signer);
}

// export async function getAccount() {
//   const provider = await getProvider();
//   const accounts = await provider.listAccounts();
//   return accounts[0];
// }

export async function getAccount() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

//This function checks if a ERC20 token exists for a given address
//    `address` - The Ethereum address to be checked
//    `signer` - The current signer
export function doesTokenExist(address, signer) {
  try {
    return new Contract(address, ERC20.abi, signer);
  } catch (err) {
    return false;
  }
}

export function getFlowRate(amount, hor) {
  return '15432098765432';
  //return amount / (hor * 3600 * 24);
}

export async function getDecimals(token) {
  const decimals = await token
    .decimals()
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.log("No tokenDecimals function for this token, set to 0");
      return 0;
    });
  return decimals;
}

// This function returns an object with 2 fields: `balance` which container's the account's balance in the particular token,
// and `symbol` which is the abbreviation of the token name. To work correctly it must be provided with 4 arguments:
//    `accountAddress` - An Ethereum address of the current user's account
//    `address` - An Ethereum address of the token to check for (either a token or AUT)
//    `provider` - The current provider
//    `signer` - The current signer
export async function getBalanceAndSymbol(
  accountAddress,
  address,
  provider,
  signer,
  weth_address,
  coins
) {
  try {
    const token = new Contract(address, ERC20.abi, signer);
    const tokenDecimals = await getDecimals(token);
    const balanceRaw = await token.balanceOf(accountAddress);
    const symbol = await token.symbol();

    var superTokenAddress = undefined;
    if (symbol == "WETH") {
      superTokenAddress = "0x0fa3561bbf4095ebbcd3bf85995dda55e3d16f95";
    } else if (symbol == "DAI") {
      superTokenAddress = "0xdb6ad3aff4c31b32327fecb110f30daf4c378b11";
    } else if (symbol == "USDC") {
      superTokenAddress = "0x2ea129c42b229bc2b8fd8f3fd74b0473da536101";
    } else if (symbol == "WBTC") {
      superTokenAddress = "0x9a1b7aa93991f31fe45f6ac02e6bb0034b5f542d";
    } else if (symbol == "USDT") {
      superTokenAddress = "0x30087b3d21775080d0b68073a658e0d43a5d966d"
    }

    console.log("symbol: ", symbol);
    console.log("superTokenAddress: ", superTokenAddress);

    return {
      balance: balanceRaw * 10 ** -tokenDecimals,
      symbol: symbol,
      superTokenAddress: superTokenAddress,
    };
  } catch (error) {
    console.log("The getBalanceAndSymbol function had an error!");
    console.log(error);
    return false;
  }
}

export default async function createNewFlow(recipient, flowRate) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  const superfluid = await Framework.create({
    chainId: Number(chainId),
    provider: provider,
  });

  const DAIxContract = await superfluid.loadSuperToken("fDAIx");
  const DAIx = DAIxContract.address;

  try {
    const createFlowOperation = superfluid.cfaV1.createFlow({
      receiver: recipient,
      flowRate: flowRate,
      superToken: DAIx,
    });

    console.log("Creating your stream...");

    const result = await createFlowOperation.exec(signer);
    console.log(result);
    console.log(
      `Congrats - you've just created a money stream!
        View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
        Network: Kovan
        Super Token: DAIx
        Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
        Receiver: ${recipient},
        FlowRate: ${flowRate}
        `
    );
  } catch (error) {
    console.log(
      "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
    );
    console.error(error);
  }
}

async function approve(provider, address, recipient, approveAmount) {
  const signer = getSigner(provider);

  const token = new ethers.Contract(address, ERC20.abi, signer);

  console.log(token);
  try {
    console.log("approving token spend");
    await token
      .approve(recipient, ethers.utils.parseEther(approveAmount.toString()))
      .then(function (tx) {
        console.log(
          `Congrats, you just approved your token spend. You can see this tx at https://rinkeby.etherscan.io/tx/${tx.hash}`
        );
      });
  } catch (error) {
    console.error(error);
  }
}

export async function streamTokens(
  address1,
  address2,
  superTokenAddress1,
  superTokenAddress2,
  amount,
  sf,
  longTermSwapContract,
  accountAddress,
  provider,
  input,
  freq,
  hor
) {
  console.log("addresses");
  console.log(address1);
  console.log(address2);

  const flowRate = getFlowRate(amount, hor);

  const pro = await getProvider();
  // load the usdcx SuperToken via the Framework (using the token address)
  const token1x = await sf.loadSuperToken(superTokenAddress1);

  // OR
  // load the daix SuperToken via the Framework (using the token symbol)
  //const token2x = await sf.loadSuperToken(address2);

  console.log("accountAddress: ", accountAddress);
  console.log("longTermSwapContract: ", longTermSwapContract.address);
  console.log("wrapped token address: ", token1x.address);
  console.log("flowrate: ", flowRate);

  var balance1 = await token1x.balanceOf({
    account: accountAddress,
    timestamp: Date.now(),
    providerOrSigner: pro,
  });

  console.log("balance1: ", balance1);

  const signer = await getSigner(provider);

  await approve(pro, address1, token1x.address, amount);
  console.log("here");
  const upgradeOperation = await token1x.upgrade({
    amount: ethers.utils.parseEther(amount.toString()),
  });
  const upgradeTxn = await upgradeOperation.exec(signer);
  await upgradeTxn.wait();
  console.log(upgradeTxn);

  var balance2 = await token1x.balanceOf({
    account: accountAddress,
    timestamp: Date.now(),
    providerOrSigner: pro,
  });

  console.log("balance2: ", balance2);
  // Write operations
  var createFlowOperation = sf.cfaV1.createFlow({
    sender: accountAddress,
    receiver: longTermSwapContract.address,
    //receiver: '0x8fEb6AD42CDd39081803bbD9b058d65807aC1362',
    superToken: token1x.address,
    flowRate: flowRate,
  });

  console.log("createFlowOperation: ", createFlowOperation);

  console.log("success");

  const sfSigner = sf.createSigner({ web3Provider: pro });
  console.log("signer: ", sfSigner);

  const txnResponse = await createFlowOperation.exec(sfSigner);
  const txnReceipt = await txnResponse.wait();
  console.log(txnReceipt);
}

// This function swaps two particular tokens / AUT, it can handle switching from AUT to ERC20 token, ERC20 token to AUT, and ERC20 token to ERC20 token.
// No error handling is done, so any issues can be caught with the use of .catch()
// To work correctly, there needs to be 7 arguments:
//    `address1` - An Ethereum address of the token to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a token or AUT)
//    `amount` - A float or similar number representing the value of address1's token to trade
//    `routerContract` - The router contract to carry out this trade
//    `accountAddress` - An Ethereum address of the current user's account
//    `signer` - The current signer
export async function swapTokens(
  address1,
  address2,
  amount,
  routerContract,
  accountAddress,
  signer
) {
  const tokens = [address1, address2];
  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = ethers.BigNumber.from(time);

  const token1 = new Contract(address1, ERC20.abi, signer);
  const tokenDecimals = await getDecimals(token1);
  const amountIn = ethers.utils.parseUnits(amount, tokenDecimals);
  const amountOut = await routerContract.callStatic.getAmountsOut(
    amountIn,
    tokens
  );

  await token1.approve(routerContract.address, amountIn);
  const wethAddress = await routerContract.WETH();

  if (address1 === wethAddress) {
    // Eth -> Token
    await routerContract.swapExactETHForTokens(
      amountOut[1],
      tokens,
      accountAddress,
      deadline,
      { value: amountIn }
    );
  } else if (address2 === wethAddress) {
    // Token -> Eth
    await routerContract.swapExactTokensForETH(
      amountIn,
      amountOut[1],
      tokens,
      accountAddress,
      deadline
    );
  } else {
    await routerContract.swapExactTokensForTokens(
      amountIn,
      amountOut[1],
      tokens,
      accountAddress,
      deadline
    );
  }
}

//This function returns the conversion rate between two token addresses
//    `address1` - An Ethereum address of the token to swaped from (either a token or AUT)
//    `address2` - An Ethereum address of the token to swaped to (either a token or AUT)
//    `amountIn` - Amount of the token at address 1 to be swaped from
//    `routerContract` - The router contract to carry out this swap
export async function getAmountOut(
  address1,
  address2,
  amountIn,
  routerContract,
  signer
) {
  try {
    const token1 = new Contract(address1, ERC20.abi, signer);
    const token1Decimals = await getDecimals(token1);

    const token2 = new Contract(address2, ERC20.abi, signer);
    const token2Decimals = await getDecimals(token2);

    const values_out = await routerContract.getAmountsOut(
      ethers.utils.parseUnits(String(amountIn), token1Decimals),
      [address1, address2]
    );
    const amount_out = values_out[1] * 10 ** -token2Decimals;
    console.log("amount out: ", amount_out);
    return Number(amount_out);
  } catch {
    return false;
  }
}

// This function calls the pair contract to fetch the reserves stored in a the liquidity pool between the token of address1 and the token
// of address2. Some extra logic was needed to make sure that the results were returned in the correct order, as
// `pair.getReserves()` would always return the reserves in the same order regardless of which order the addresses were.
//    `address1` - An Ethereum address of the token to trade from (either a ERC20 token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a ERC20 token or AUT)
//    `pair` - The pair contract for the two tokens
export async function fetchReserves(address1, address2, pair, signer) {
  try {
    // Get decimals for each coin
    const coin1 = new Contract(address1, ERC20.abi, signer);
    const coin2 = new Contract(address2, ERC20.abi, signer);

    const coin1Decimals = await getDecimals(coin1);
    const coin2Decimals = await getDecimals(coin2);

    // Get reserves
    const reservesRaw = await pair.getReserves();

    console.log("reservesRaw: ", reservesRaw);

    // Put the results in the right order
    const results = [
      (await pair.token0()) === address1 ? reservesRaw[0] : reservesRaw[1],
      (await pair.token1()) === address2 ? reservesRaw[1] : reservesRaw[0],
    ];

    // Scale each to the right decimal place
    return [
      results[0] * 10 ** -coin1Decimals,
      results[1] * 10 ** -coin2Decimals,
    ];
  } catch (err) {
    console.log("error!");
    console.log(err);
    return [0, 0];
  }
}

// This function returns the reserves stored in a the liquidity pool between the token of address1 and the token
// of address2, as well as the liquidity tokens owned by accountAddress for that pair.
//    `address1` - An Ethereum address of the token to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a token or AUT)
//    `factory` - The current factory
//    `signer` - The current signer
export async function getReserves(
  address1,
  address2,
  factory,
  signer,
  accountAddress
) {
  try {
    const pairAddress = await factory.getPair(address1, address2);
    console.log("pairAddress: ", pairAddress);
    const pair = new Contract(pairAddress, PAIR.abi, signer);

    if (pairAddress !== "0x0000000000000000000000000000000000000000") {
      const reservesRaw = await fetchReserves(address1, address2, pair, signer);
      const liquidityTokens_BN = await pair.balanceOf(accountAddress);
      const liquidityTokens = Number(
        ethers.utils.formatEther(liquidityTokens_BN)
      );
      return [
        reservesRaw[0].toPrecision(6),
        reservesRaw[1].toPrecision(6),
        liquidityTokens,
      ];
    } else {
      console.log("no reserves yet");
      return [0, 0, 0];
    }
  } catch (err) {
    console.log("error!");
    console.log(err);
    return [0, 0, 0];
  }
}
