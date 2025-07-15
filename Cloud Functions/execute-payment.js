const functions = require("@google-cloud/functions-framework");
const Firestore = require("@google-cloud/firestore");
const {
  abi: abiERC20,
} = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const {
  DynamicProvider,
  FallbackStrategy,
} = require("ethers-dynamic-provider");
const { parseEther, parseUnits, Interface, Wallet } = require("ethers");

const db = new Firestore({
  projectId: "effisend",
  keyFilename: "credential.json",
});

const Accounts = db.collection("Accounts");

const rpcs = [
  "https://arbitrum-sepolia-rpc.publicnode.com",
  "https://sepolia-rollup.arbitrum.io/rpc",
  "https://arbitrum-sepolia.public.blastapi.io",
  "https://arbitrum-sepolia.drpc.org/",
];

const provider = new DynamicProvider(rpcs, {
  strategy: new FallbackStrategy(),
});

const tokens = [
  {
    name: "Ethereum (ARB)",
    color: "#28A0F0",
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    coingecko: "ethereum",
  },
  {
    name: "MXNB (ARB)",
    color: "#00ff44",
    symbol: "MXNB",
    address: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D",
    decimals: 6,
    coingecko: "mxnb",
  },
  {
    name: "USDC (ARB)",
    color: "#2775ca",
    symbol: "USDC",
    address: "0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1",
    decimals: 6,
    coingecko: "usd-coin",
  },
  {
    name: "Tether (ARB)",
    color: "#008e8e",
    symbol: "USDT",
    address: "0xE5b6C29411b3ad31C3613BbA0145293fC9957256",
    decimals: 6,
    coingecko: "tether",
  },
  {
    name: "Wrapped ETH (ARB)",
    color: "#ffffff",
    symbol: "WETH",
    address: "0x2836ae2eA2c013acD38028fD0C77B92cccFa2EE4",
    decimals: 18,
    coingecko: "weth",
  },
];

functions.http("helloHttp", async (req, res) => {
  try {
    let query = await Accounts.where("user", "==", req.body.user).get();
    if (query.empty) {
      throw "BAD USER";
    }
    const { privateKey } = query.docs[0].data();
    const wallet = new Wallet(privateKey, provider);
    let transaction;
    if (req.body.token === 0) {
      transaction = {
        to: req.body.destination,
        value: parseEther(req.body.amount),
      };
    } else {
      const interface = new Interface(abiERC20);
      const data = interface.encodeFunctionData("transfer", [
        req.body.destination,
        parseUnits(req.body.amount, tokens[req.body.token].decimals),
      ]);
      transaction = {
        to: tokens[req.body.token].address,
        data,
      };
    }
    const result = await wallet.sendTransaction(transaction);
    res.send({
      error: null,
      result: result.hash,
    });
  } catch (e) {
    console.log(e);
    res.send({
      error: "Bad Request",
      result: null,
    });
  }
});
