const crypto = require("crypto");
const { apiKey, apiSecret } = require("./secrets");

function signRequest(request) {
    const nonce = Date.now().toString();
    const method = request.method; // e.g., 'GET', 'POST'
    const path = request.path; // e.g., '/api/v1/example'
    const body = request.body || ""; // Raw body of the request
    const data = `${nonce}${method}${path}${body}`;
    const hmac = crypto.createHmac("sha256", apiSecret);
    hmac.update(data);
    const signature = hmac.digest("hex");
    return `Bitso ${apiKey}:${nonce}:${signature}`;
}

async function getClabes() {
    // Platform to Bank
    const requestOptions = {
        method: "GET",
        redirect: "follow",
        path: "/mint_platform/v1/accounts/banks",
    };
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", signRequest(requestOptions));
    requestOptions.headers = myHeaders;

    return new Promise((resolve) => {
        fetch(
            `https://stage.buildwithjuno.com${requestOptions.path}`,
            requestOptions
        )
            .then((response) => response.json())
            .then((result) => resolve(result))
            .catch(() => resolve(null));
    });
}

async function speiToBank(body) {
    // Platform to Bank
    const requestOptions = {
        method: "POST",
        path: "/mint_platform/v1/redemptions",
        redirect: "follow",
        body: JSON.stringify(body),
    };
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", signRequest(requestOptions));
    requestOptions.headers = myHeaders;

    return new Promise((resolve) => {
        fetch(
            `https://stage.buildwithjuno.com${requestOptions.path}`,
            requestOptions
        )
            .then((response) => response.json())
            .then((result) => resolve(result))
            .catch(() => resolve(null));
    });
}

async function depositToPlatform(body) {
    // Platform to Bank
    const requestOptions = {
        method: "POST",
        path: "/spei/test/deposits",
        redirect: "follow",
        body: JSON.stringify(body),
    };
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", signRequest(requestOptions));
    requestOptions.headers = myHeaders;

    return new Promise((resolve) => {
        fetch(
            `https://stage.buildwithjuno.com${requestOptions.path}`,
            requestOptions
        )
            .then((response) => response.json())
            .then((result) => resolve(result))
            .catch(() => resolve(null));
    });
}

async function createClabe() {
    const requestOptions = {
        method: "POST",
        path: "/mint_platform/v1/clabes",
        redirect: "follow",
    };
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", signRequest(requestOptions));
    requestOptions.headers = myHeaders;

    return new Promise((resolve) => {
        fetch(
            `https://stage.buildwithjuno.com${requestOptions.path}`,
            requestOptions
        )
            .then((response) => response.json())
            .then((result) => {
                console.log(result)
                resolve(result)
            })
            .catch(() => resolve(null));
    });
}

async function addBlockchain(body) {
    const requestOptions = {
        method: "POST",
        path: "/mint_platform/v1/accounts/blockchain",
        redirect: "follow",
        body: JSON.stringify(body)
    };
    console.log(requestOptions);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", signRequest(requestOptions));
    requestOptions.headers = myHeaders;

    return new Promise((resolve) => {
        fetch(
            `https://stage.buildwithjuno.com${requestOptions.path}`,
            requestOptions
        )
            .then((response) => response.json())
            .then((result) => {
                console.log(result)
                resolve(result)
            })
            .catch(() => resolve(null));
    });
}

async function addBankAccount(body) {
    const requestOptions = {
        method: "POST",
        path: "/mint_platform/v1/accounts/banks",
        redirect: "follow",
        body: JSON.stringify(body)
    };
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", signRequest(requestOptions));
    requestOptions.headers = myHeaders;

    return new Promise((resolve) => {
        fetch(
            `https://stage.buildwithjuno.com${requestOptions.path}`,
            requestOptions
        )
            .then((response) => response.json())
            .then((result) => {
                console.log(result)
                resolve(result)
            })
            .catch(() => resolve(null));
    });
}

module.exports = {
    speiToBank,
    getClabes,
    depositToPlatform,
    createClabe,
    addBlockchain,
    addBankAccount
};
