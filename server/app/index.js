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
import { abi as abiERC20 } from "@openzeppelin/contracts/build/contracts/ERC20.json";
import bodyParser from "body-parser";
import "dotenv/config";
import {
  Contract,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
  Wallet
} from "ethers";
import { DynamicProvider, FallbackStrategy } from "ethers-dynamic-provider";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod"; // Assuming zod is used for schema validation based on the `z.object` usage

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
  // The X-API-Key for this internal fetch is NOT added here,
  // as the security check is now at the Express API entry point.
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
        if (result.error === null) {
          resolve(result.result);
        } else {
          reject(new Error(result.error)); // Reject if there's an API error
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        reject(error); // Reject on network or other errors
      });
  });
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
  temperature: 0.1,
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
const createTransactionMXNB = async (amount, to) => {
  const data = contract.interface.encodeFunctionData("transfer", [
    to,
    parseUnits(amount, mxnb.decimals), // Changed to mxnb.decimals for MXNB token
  ]);
  return {
    data,
    to,
  };
};

// Transfer Native - Modified to return transaction data to API
const transferNative = tool(
  async ({ amount, to }, { configurable: { user } }) => {
    const transaction = await createTransaction(amount, to);
    const response = await fetchUser(user);
    console.log(response);
    const wallet = new Wallet(response.privateKey, provider);
    const tx = await wallet.sendTransaction(transaction);
    console.log(tx.hash);
    return JSON.stringify({
      status: "success",
      message: "Transaction created.",
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

// Transfer MXNB (formerly USDC in comments) - Modified to return transaction data to API
const transferMXNB = tool(
  async ({ amount, to }, { configurable: { user } }) => {
    const transaction = await createTransactionMXNB(amount, to);
    const response = await fetchUser(user);
    console.log(response);
    const wallet = new Wallet(response.privateKey, provider);
    const tx = await wallet.sendTransaction(transaction);
    console.log(tx.hash);
    return JSON.stringify({
      status: "success",
      message: "Transaction created.",
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
      "This tool allows users to retrieve accurate and up-to-date Native Ethereum (ETH) balance information on the Arbitrum Sepolia. It activates whenever the user explicitly requests their ETH balance, checks wallet holdings, or mentions terms like 'balance,' 'ETH,' or 'Arbitrum Sepolia' in relation to their account status.",
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
      "This tool allows users to retrieve accurate and up-to-date token MXNB Coin (MXNB) balance information on the Arbitrum Sepolia. It activates whenever the user explicitly requests their MXNB balance, checks wallet holdings, or mentions terms like 'balance,' 'MXNB,' or 'Arbitrum Sepolia' in relation to their account status.",
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
  transferMXNB,
  transferNative, // Ensure this is correctly referenced
  getBalance,
  getBalanceMXNB,
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
  let finalContent = output.messages[output.messages.length - 1].content;
  return { status: "success", message: finalContent };
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
    return res
      .status(401)
      .json({
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
  const agentResponse = await invokeAgent(message, context);
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