const functions = require('@google-cloud/functions-framework');
const Firestore = require("@google-cloud/firestore");
const { Wallet, Contract } = require("ethers");
const { DynamicProvider, FallbackStrategy } = require("ethers-dynamic-provider");
const { abi } = require("./distribution.js")
const { clabe } = require('clabe-validator');
const {
    createClabe,
    addBlockchain,
    addBankAccount
} = require("./junoFunctions");
var random_name = require("node-random-name");

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
]
const provider = new DynamicProvider(rpcs, {
    strategy: new FallbackStrategy(),
});
const wallet = new Wallet("0xPrivateKey", provider);

const contract = new Contract("0x04A4e03a1F879DE1F03D3bBBccd9CB9500d6A7e8", abi, wallet)

functions.http('helloHttp', async (req, res) => {
    try {
        const user = req.body.user
        let query = await Accounts.where("user", "==", user).get();
        if (query.empty) {
            const wallet = Wallet.createRandom();
            const address = wallet.address;
            const myClabe = clabe.calculate(002, 180, generateRandomNumber()); // Bank Clabe
            const tempRClabe = await createClabe();
            await addBlockchain({
                tag: user,
                network: "ARBITRUM",
                address
            })
            await addBankAccount({
                tag: user,
                recipient_legal_name: random_name(),
                clabe: myClabe,
                ownership: "THIRD_PARTY",
            })
            const rclabe = tempRClabe.payload.clabe; // Juno Auto Payment Clabe
            let dataframe = {
                privateKey: wallet.privateKey,
                address,
                user,
                clabe: myClabe,
                rclabe,
            }
            await Accounts.doc(user).set(dataframe);
            await contract.allocateReward(address);
            res.send({
                error: null,
                result: {
                    address,
                    user,
                    clabe: myClabe,
                    rclabe
                }
            });
        } else {
            const { user, address, clabe: myClabe, rclabe } = query.docs[0].data();
            res.send({
                error: null,
                result: {
                    address,
                    user,
                    clabe: myClabe,
                    rclabe
                }
            });
        }
    }
    catch (e) {
        console.log(e)
        res.send({
            error: "BAD REQUEST",
            result: null
        });
    }
});

function generateRandomNumber() {
    const min = Math.pow(10, 10);
    const max = Math.pow(10, 11) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

