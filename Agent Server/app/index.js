import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { tool } from "@langchain/core/tools";
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import bodyParser from "body-parser";
import "dotenv/config";
import {
  Contract,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
  Wallet,
} from "ethers";
import { DynamicProvider, FallbackStrategy } from "ethers-dynamic-provider";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod"; // Assuming zod is used for schema validation based on the `z.object` usage
import fs from "fs";
const abiPath =
  "app/node_modules/@openzeppelin/contracts/build/contracts/ERC20.json";
const { abi: abiERC20 } = JSON.parse(fs.readFileSync(abiPath, "utf-8"));

///////////////////////////////////////// Program Tools ////////////////////////////////////////

function setupProvider(rpcs) {
  return new DynamicProvider(rpcs, {
    strategy: new FallbackStrategy(),
  });
}

function epsilonRound(value, decimals = 6) {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

const rpcs = [
  "https://arbitrum-sepolia-rpc.publicnode.com",
  "https://sepolia-rollup.arbitrum.io/rpc",
  "https://arbitrum-sepolia.public.blastapi.io",
  "https://arbitrum-sepolia.drpc.org/",
];

const mxnb = {
  address: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D",
  decimals: 6,
};

const provider = setupProvider(rpcs);
const contract = new Contract(mxnb.address, abiERC20, provider);

////////////////////////////////////////// API Functions (internal) ////////////////////////////////////////

async function fetchUser(user) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    user,
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  return new Promise((resolve, reject) => {
    fetch(process.env.FETCH_USER_API_URL, requestOptions)
      .then((response) => response.json())
      .then(async (result) => {
        if (result.e === null) {
          resolve(result.result);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        reject(error); // Reject on network or other errors
      });
  });
}

async function exexuteTranfer(body) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(body);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  return new Promise((resolve, reject) => {
    fetch(process.env.MXNB_TO_LINEA_API_URL, requestOptions)
      .then((response) => response.json())
      .then(async (result) => {
        if (result.error === null) {
          resolve(result.result);
        } else {
          resolve("ok");
        }
      })
      .catch((error) => {
        console.error("Error executing transfer:", error);
        reject(error); // Reject on network or other errors
      });
  });
}

async function executeTranferToSpei(body) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(body);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  return new Promise((resolve, reject) => {
    fetch(process.env.MXNB_TO_SPEI_API_URL, requestOptions)
      .then((response) => response.json())
      .then(async (result) => {
        if (result.error === null) {
          resolve(result.result);
        } else {
          resolve("ok");
        }
      })
      .catch((error) => {
        console.error("Error executing transfer:", error);
        resolve("ok"); // Reject on network or other errors
      });
  });
}

async function executePayments(clabeList, amount, user) {
  const endpoint = process.env.MXNB_TO_SPEI_API_URL;
  const results = [];

  for (const clabe of clabeList) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clabe, amount, user }),
      });

      const data = await res.json();
      results.push({ clabe, ...data });
    } catch (err) {
      results.push({ clabe, error: err, result: "fetch_failed" });
    }
  }

  console.log(results);

  const allOk = results.every(function (r) {
    return r.error === null && r.result === "ok";
  });

  return allOk ? "ok" : "error";
}

////////////////////////////////////////// Agent Setup ////////////////////////////////////////

// This config will now be passed from the API request context
const config = (data = {}) => {
  return { configurable: { thread_id: uuidv4(), ...data } };
};

// Classes
const webSearchTool = new DuckDuckGoSearch({
  safeSearch: "strict",
  maxResults: 10,
});

// Model
const llm = new ChatOllama({
  model: "llama3.1:8b",
  temperature: 0.05,
  maxRetries: 2,
  keepAlive: "24h",
  numCtx: 1024 * 25,
});

// Create Transaction
const createTransaction = (amount, to) => {
  return {
    value: parseEther(amount),
    to,
  };
};

// Create Transaction MXNB
const createTransactionMXNB = (amount, to) => {
  const data = contract.interface.encodeFunctionData("transfer", [
    to,
    parseUnits(amount, mxnb.decimals), // Changed to mxnb.decimals for MXNB token
  ]);
  return {
    data,
    to: mxnb.address,
  };
};

// Transfer Native - Modified to return transaction data to API
const transferNative = tool(
  async ({ amount, to }, { configurable: { user } }) => {
    const transaction = await createTransaction(amount, to);
    console.log(user);
    const response = await fetchUser(user);
    console.log(response);
    const wallet = new Wallet(response.privateKey, provider);
    const tx = await wallet.sendTransaction(transaction);
    console.log(tx.hash);
    return JSON.stringify({
      status: "success",
      message: "Transaction created and available on Arbitrum Sepolia.",
      transaction: tx.hash,
    });
  },
  {
    name: "transfer_native",
    description:
      "This tool facilitates native Ethereum (ETH) transfers on the Arbitrum Sepolia. It generates the transaction data for the user to sign. It activates whenever the user explicitly requests to send ETH, initiates a transaction, or mentions terms like 'transfer,' 'ETH,' or 'Arbitrum Sepolia' in relation to their wallet activity.",
    schema: z.object({
      amount: z.string(),
      to: z.string(),
    }),
  }
);

// Transfer MXNB Arbitrum to USDC Linea - Only on Mainnet
const transferMXNB = tool(
  async ({ amount, to }, { configurable: { user } }) => {
    const transaction = createTransactionMXNB(amount, to);
    const response = await fetchUser(user);
    console.log(response);
    const wallet = new Wallet(response.privateKey, provider);
    const tx = await wallet.sendTransaction(transaction);
    console.log(tx.hash);
    return JSON.stringify({
      status: "success",
      message: "Transaction created and available on Arbitrum Sepolia.",
      transaction: tx.hash,
    });
  },
  {
    name: "transfer_mxnb",
    description:
      "This tool facilitates MXNB Coin (MXNB) transfers on the Arbitrum Sepolia. It generates the transaction data for the user to sign. It activates whenever the user explicitly requests to send MXNB, initiates a transaction, or mentions terms like 'transfer,' 'MXNB,' or 'Arbitrum Sepolia' in relation to their wallet activity.",
    schema: z.object({
      amount: z.string(),
      to: z.string(),
    }),
  }
);

const transferToSpei = tool(
  async ({ amount, clabe }, { configurable: { user } }) => {
    const response = await executeTranferToSpei({ amount, clabe, user });
    return JSON.stringify({
      status: "success",
      message: "Your balance is now available on your CLABE.",
      transaction: response,
    });
  },
  {
    name: "transfer_to_spei",
    description:
      "This tool facilitates MXNB Coin (MXNB) transfers on the Arbitrum Sepolia to a Spei CLABE account. It activates when the user explicitly requests to send MXNB to a CLABE or mentions relevant terms such as 'transfer,' 'MXNB,' 'Arbitrum Sepolia,' or 'Spei CLABE' in the context of wallet activity.",
    schema: z.object({
      amount: z.string(),
      clabe: z.string(),
    }),
  }
);

const transferToSPEImultiple = tool(
  async ({ amount }, { configurable: { user } }) => {
    const clabes = [
      "002180561501567250",
      "002180519974240622",
      "002180245215700836",
    ];
    const response = await executePayments(clabes, amount, user);
    return JSON.stringify({
      status: "success",
      message: "All the CLABES received the payment. Correctly.",
    });
  },
  {
    name: "transfer_to_multiple_spei",
    description:
      "This tool enables automated MXNB Coin (MXNB) transfers from the Arbitrum Sepolia testnet to multiple SPEI CLABE accounts via a backend API. Designed for batch payment operations to the employees of this client, it ensures parallel execution, response validation, and detailed transaction reporting. It activates whenever users request to transfer MXNB to several CLABEs or reference actions involving 'MXNB','Arbitrum Sepolia', 'SPEI CLABE,' or other relevant wallet activity keywords.",
    schema: z.object({
      amount: z.string(),
    }),
  }
);

// Transfer MXNB - Modified to return transaction data to API
const fundMemamaskCard = tool(
  async ({ amount, to }, { configurable: { user } }) => {
    const response = await exexuteTranfer({ amount, to, user });
    //const response = "ok";
    return JSON.stringify({
      status: "success",
      message: "Your balance is now available on your Metamask Card.",
      transaction: response,
    });
  },
  {
    name: "fund_metamask_card",
    description:
      "This tool facilitates MXNB Coin (MXNB) transfers on the Arbitrum Mainnet to USDC on Linea. It generates transaction data for the user to sign and activates when the user explicitly opts to send MXNB to a MetaMask Card or mentions relevant terms such as 'transfer,' 'MXNB,' 'Arbitrum Mainnet,' or 'MetaMask Card' in the context of wallet activity.",
    schema: z.object({
      amount: z.string(),
      to: z.string(),
    }),
  }
);

// Get Native Balance - Modified for API response
const getBalance = tool(
  async (_, { configurable: { address } }) => {
    console.log("Get Balance Tool invoked.");
    const balance = await provider.getBalance(address);
    const balanceInEth = parseFloat(formatEther(balance)).toFixed(6);
    console.log("Balance in ETH:", balanceInEth);
    return JSON.stringify({
      status: "success",
      balance: `${balanceInEth} ETH`,
    });
  },
  {
    name: "get_balance",
    description:
      "This tool retrieves the user's current **Ethereum (ETH) native token balance** on the Arbitrum Sepolia testnet. Use this when the user specifically asks for their **ETH balance**, 'native token' balance, or general wallet funds on Arbitrum Sepolia.",
    schema: z.object({}),
  }
);

// Get MXNB Balance - Modified for API response
const getBalanceMXNB = tool(
  async (_, { configurable: { address } }) => {
    console.log("Get Balance MXNB Tool invoked.");
    const balance = await contract.balanceOf(address);
    const balanceInMXNB = parseFloat(
      formatUnits(balance, mxnb.decimals)
    ).toFixed(6);
    console.log("Balance in MXNB:", balanceInMXNB);
    return JSON.stringify({
      status: "success",
      balance: `${balanceInMXNB} MXNB`,
    });
  },
  {
    name: "get_balance_mxnb",
    description:
      "MXNB ERC-20 token balance tool. This tool retrieves the user's current MXNB ERC-20 token balance on the Arbitrum Sepolia testnet. Activate this when the user explicitly asks for their **MXNB balance**, 'MXNB tokens', or other phrases clearly indicating a request for the MXNB token.",
    schema: z.object({}),
  }
);

// Web Search Tool - Modified for API response
const webSearch = tool(
  async ({ query }) => {
    console.log("Web Search Tool invoked with query:", query);
    const res = await webSearchTool.invoke(query); // Assuming webSearchTool has an invoke method
    return JSON.stringify({ status: "success", query, results: res });
  },
  {
    name: "web_search",
    description:
      "This tool allows users to perform accurate and targeted internet searches for specific terms or phrases. It activates whenever the user explicitly requests a web search, seeks real-time or updated information, or mentions terms like 'search,' 'latest,' or 'current' related to the desired topic.",
    schema: z.object({
      query: z.string(),
    }),
  }
);

// List of Tools - Modified for API response
const listOfTools = tool(
  () => {
    console.log("List of Tools Tool invoked.");
    return JSON.stringify({
      status: "info",
      message:
        "DeSmond can search the web, help you fund your MetaMask card, coordinate batch payments to your workers, and transfer your MXN₿ to a CLABE account.",
    });
  },
  {
    name: "list_of_tools",
    description:
      "This tool provides a list of available tools for the user to interact with. It activates whenever the user explicitly requests information about available tools or commands.",
    schema: z.object({}),
  }
);

// Fallback Tool - Modified for API response
const fallbackTool = tool(
  () => {
    console.log("Fallback Tool invoked.");
    return JSON.stringify({
      status: "info",
      message:
        "As stated above, say something friendly and invite the user to interact with you.",
    });
  },
  {
    name: "fallback",
    description:
      "This tool activates only when the assistant has no other tool actively invoked in response to a user query",
    schema: z.object({}),
  }
);

// Utils for Agent
function setInput(input) {
  return {
    messages: [
      {
        role: "system",
        content:
          "Act as DeSmond, a highly knowledgeable, perceptive, and approachable assistant. Never return lines of code like python or nodejs. DeSmond is capable of providing accurate insights, answering complex inquiries, and offering thoughtful guidance in various domains. Never return lines of code like python or nodejs. Embody professionalism and warmth, tailoring responses to meet the user's needs effectively while maintaining an engaging and helpful tone. Never return lines of code like python or nodejs.",
      },
      {
        role: "user",
        content: input,
      },
    ],
  };
}

// Workflow Tools
const all_api_tools = [
  webSearch,
  fallbackTool,
  fundMemamaskCard,
  listOfTools,
  transferToSpei,
  transferToSPEImultiple,
  getBalance,
  getBalanceMXNB,
  transferMXNB,
  transferNative,
];

const tools_node = new ToolNode(all_api_tools);
const llm_with_tools = llm.bindTools(all_api_tools);

// Workflow Utils
const call_model = async (state) => {
  console.log("Model Node");
  const response = await llm_with_tools.invoke(state.messages);
  return { messages: response };
};

function shouldContinue(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  console.log("Last message tool calls:", lastMessage["tool_calls"]);

  if (lastMessage["tool_calls"] && lastMessage["tool_calls"].length > 0) {
    return "tool";
  } else {
    return END;
  }
}

// Workflow
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", call_model)
  .addNode("tool", tools_node)
  .addConditionalEdges("model", shouldContinue, ["tool", END])
  .addEdge(START, "model")
  .addEdge("tool", "model");

const memory = new MemorySaver(); // For state management across turns if needed

// Graph Compilation
const graph = workflow.compile({ checkpointer: memory });

async function invokeAgent(message, contextData) {
  const input = setInput(message);
  const context = config(contextData); // Pass dynamic context (fromAddress, members)
  const output = await graph.invoke(input, context);
  const tool = output.messages[2]["tool_calls"]?.[0]?.name ?? null;
  let finalContent = output.messages[output.messages.length - 1].content;
  return { status: "success", message: finalContent, last_tool: tool };
}

///////////////////////////////////////// Express.js API Setup ////////////////////////////////////////

const app = express();
const port = process.env.PORT || 8000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Middleware for API Key authentication
app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.AI_URL_API_KEY) {
    console.warn("Unauthorized access attempt: Invalid or missing X-API-Key");
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: Invalid or missing API Key.",
    });
  }
  next(); // Continue to the next middleware/route handler if API key is valid
});

// Main API endpoint to interact with the agent
app.post("/api/chat", async (req, res) => {
  const { message, context } = req.body;
  console.log("Received message:", message);
  console.log("Received context:", context);
  const contextData = context || {};
  const agentResponse = await invokeAgent(message, contextData);
  res.status(200).json(agentResponse);
});

// Basic health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "DeSmond API is running." });
});

// Start the server
app.listen(port, () => {
  console.log(`DeSmond API listening at http://localhost:${port}`);
});
