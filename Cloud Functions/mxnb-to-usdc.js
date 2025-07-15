const functions = require("@google-cloud/functions-framework");
const Firestore = require("@google-cloud/firestore");
const { computePoolAddress, FeeAmount } = require("@uniswap/v3-sdk");
const { CHAIN_TO_ADDRESSES_MAP, ChainId, Token } = require("@uniswap/sdk-core");
const {
  DynamicProvider,
  FallbackStrategy,
} = require("ethers-dynamic-provider");
const { Contract, parseUnits, Wallet } = require("ethers");
const {
  abi: ERC20abi,
} = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const {
  abi: QuoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const { SwapRouter } = require("@uniswap/v3-sdk");
const { convertQuoteToRoute, getQuote } = require("@lifi/sdk");

function setupProvider(rpcs) {
  return new DynamicProvider(rpcs, {
    strategy: new FallbackStrategy(),
  });
}

const rpcs = [
  "https://arbitrum-one-rpc.publicnode.com",
  "https://arb-pokt.nodies.app",
  "https://arbitrum.drpc.org",
];

const provider = setupProvider(rpcs);

const db = new Firestore({
  projectId: "effisend",
  keyFilename: "credential.json",
});

const Accounts = db.collection("Accounts");

const InputToken = new Token(
  ChainId.ARBITRUM_ONE,
  "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA",
  6,
  "MXNB",
  "MXN Token"
);

const OutputToken = new Token(
  ChainId.ARBITRUM_ONE,
  "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  6,
  "USDT",
  "USD₮0"
);

const LineaToken = new Token(
  59144,
  "0x176211869ca2b568f2a7d4ee941e073a821ee1ff",
  6,
  "USDC",
  "USD Coin"
);

const currentPoolAddress = computePoolAddress({
  factoryAddress:
    CHAIN_TO_ADDRESSES_MAP[ChainId.ARBITRUM_ONE].v3CoreFactoryAddress,
  tokenA: InputToken,
  tokenB: OutputToken,
  fee: FeeAmount.MEDIUM,
  chainId: ChainId.ARBITRUM_ONE,
});

const poolContract = new Contract(
  currentPoolAddress,
  IUniswapV3PoolABI,
  provider
);

const quoterContract = new Contract(
  CHAIN_TO_ADDRESSES_MAP[ChainId.ARBITRUM_ONE].quoterAddress,
  QuoterABI,
  provider
);

const swapperAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

functions.http("helloHttp", async (req, res) => {
  try {
    const amount = req.body.amount;
    const address = req.body.to;
    let query = await Accounts.where("user", "==", req.body.user).get();
    if (query.empty) {
      throw "BAD USER";
    }
    const { privateKey } = query.docs[0].data();
    const wallet = new Wallet(privateKey, provider);
    const swapperContract = new Contract(
      swapperAddress,
      SwapRouter.INTERFACE.format(),
      wallet
    );
    const InputTokenContract = new Contract(
      InputToken.address,
      ERC20abi,
      wallet
    );
    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ]);

    const quotedAmountOut =
      await quoterContract.quoteExactInputSingle.staticCall(
        token0,
        token1,
        fee,
        parseUnits(amount, InputToken.decimals).toString(),
        0
      );

    const approveTransaction = await InputTokenContract.approve(
      swapperAddress,
      parseUnits(amount, InputToken.decimals).toString()
    );

    await approveTransaction.wait();
    console.log(approveTransaction.hash);

    const swapParameters = {
      tokenIn: InputToken.address,
      tokenOut: OutputToken.address,
      fee,
      recipient: wallet.address,
      deadline: Math.floor(new Date().getTime() / 1000 + 60 * 10),
      amountIn: parseUnits(amount, InputToken.decimals).toString(),
      amountOutMinimum: quotedAmountOut,
      sqrtPriceLimitX96: 0,
    };

    const swapTransaction = await swapperContract.exactInputSingle(
      swapParameters
    );
    await swapTransaction.wait();
    console.log(swapTransaction.hash);

    //////////////////////////////////////// Bridge to USDC on linea //////////////////////////////////////
    const quoteRequest = {
      fromChain: ChainId.ARBITRUM_ONE, // Arbitrum
      toChain: LineaToken.chainId, // Linea
      fromToken: OutputToken.address, // USDT on Arbitrum
      toToken: LineaToken.address, // USDC on Linea
      fromAmount: quotedAmountOut, // 1 USDC
      fromAddress: wallet.address,
      toAddress: address, // Metamask card address,
      //denyBridges:["across"]
    };
    const quote = await getQuote(quoteRequest);
    const route = convertQuoteToRoute(quote);
    const transaction = route.steps[0].transactionRequest;
    const contract = new Contract(quoteRequest.fromToken, ERC20abi, provider);
    const transactionApproval = await contract.interface.encodeFunctionData(
      "approve",
      [transaction.to, quoteRequest.fromAmount]
    );
    const resultApproval = await wallet.sendTransaction({
      from: wallet.address,
      to: quoteRequest.fromToken,
      data: transactionApproval,
    });
    const receiptApproval = await resultApproval.wait();
    console.log(receiptApproval.hash);
    const resultCCTP = await wallet.sendTransaction(transaction);
    const receiptCCTP = await resultCCTP.wait();
    console.log(receiptCCTP.hash);
    res.send({
      error: null,
      result: receiptCCTP.hash,
    });
  } catch (e) {
    console.log(e);
    res.send({
      error: "Bad Request",
      result: null,
    });
  }
});
