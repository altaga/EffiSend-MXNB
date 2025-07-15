const functions = require('@google-cloud/functions-framework');
const Firestore = require("@google-cloud/firestore");
const {
    abi: ERC20abi,
} = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const {
    DynamicProvider,
    FallbackStrategy,
} = require("ethers-dynamic-provider");
const {
    Contract,
    parseUnits,
    Wallet,
} = require("ethers");
const {
    speiToBank,
    getClabes,
} = require("./junoFunctions");

function setupProvider(rpcs) {
    return new DynamicProvider(rpcs, {
        strategy: new FallbackStrategy(),
    });
}

const rpcs = [
    "https://arbitrum-sepolia-rpc.publicnode.com",
    "https://sepolia-rollup.arbitrum.io/rpc",
    "https://arbitrum-sepolia.public.blastapi.io",
    "https://arbitrum-sepolia.drpc.org/",
]

const provider = setupProvider(rpcs);

const db = new Firestore({
    projectId: "effisend",
    keyFilename: "credential.json",
});

const Accounts = db.collection("Accounts");

const junoAddress = "0xc8fb8ef6F78DD86856e586F392F33519DaE462Ad"

functions.http('helloHttp', async (req, res) => {
    try {
        let query = await Accounts.where("user", "==", req.body.user).get();
        if (query.empty) {
            throw "BAD USER"
        }

        const { payload } = await getClabes();
        const clientObject = payload.find((x) => req.body.clabe === x.clabe);
        if (!clientObject) {
            throw "BAD CLABE"
        }
        const { id } = clientObject;
        await speiToBank({
            amount: parseInt(req.body.amount),
            destination_bank_account_id: id,
            asset: "mxn",
        })
        const { privateKey } = query.docs[0].data();
        const wallet = new Wallet(privateKey, provider);
        const contract = new Contract("0x82B9e52b26A2954E113F94Ff26647754d5a4247D", ERC20abi, wallet)
        const transaction = await contract.transfer(junoAddress, parseUnits(req.body.amount, 6))
        await transaction.wait();
        
        res.send({
            error: null,
            result: "ok",
        });
    } catch (e) {
        console.log(e);
        res.send({
            error: "Bad Request",
            result: null,
        });
    }
});
