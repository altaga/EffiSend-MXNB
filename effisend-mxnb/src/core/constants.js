import { Dimensions, Image, PixelRatio, Platform } from "react-native";
// Blockchain
import ARB from "../assets/logos/arb.png";
import MXNB from "../assets/logos/mxnb.png";
import MXN from "../assets/logos/mxn.png";
import USDC from "../assets/logos/usdc.png";
import USDT from "../assets/logos/usdt.png";
import WETH from "../assets/logos/weth.png";

const normalizeFontSize = (size) => {
  let { width, height } = Dimensions.get("window");
  if (Platform.OS === "web" && height / width < 1) {
    width /= 2.3179;
    height *= 0.7668;
  }
  const scale = Math.min(width / 375, height / 667); // Based on a standard screen size
  return PixelRatio.roundToNearestPixel(size * scale);
};

const w = normalizeFontSize(50);
const h = normalizeFontSize(50);

export const refreshTime = 1000 * 60 * 1;

export const USDCicon = (
  <Image source={USDC} style={{ width: 30, height: 30, borderRadius: 10 }} />
);

export const iconsBlockchain = {
  mxnb: (
    <Image source={MXNB} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  arb: <Image source={ARB} style={{ width: w, height: h, borderRadius: 10 }} />,
  usdc: (
    <Image source={USDC} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  usdt: (
    <Image source={USDT} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  weth: (
    <Image source={WETH} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
};

export const blockchains = [
  {
    network: "Arbitrum",
    apiname: "arb",
    token: "ETH",
    chainId: 421614,
    blockExplorer: "https://sepolia.arbiscan.io/",
    rpc: [
      "https://arbitrum-sepolia-rpc.publicnode.com",
      "https://sepolia-rollup.arbitrum.io/rpc",
      "https://arbitrum-sepolia.public.blastapi.io",
      "https://arbitrum-sepolia.drpc.org/",
    ],
    iconSymbol: "eth",
    decimals: 18,
    batchBalancesAddress: "0xcf4902BC621E97B8d574f1E91c342f0c44C8baE5",
    rewardsContract: "0x04A4e03a1F879DE1F03D3bBBccd9CB9500d6A7e8",
    color: "#28A0F0",
    tokens: [
      {
        name: "Ethereum (ARB)",
        color: "#28A0F0",
        symbol: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        icon: iconsBlockchain.arb,
        coingecko: "ethereum",
      },
      {
        name: "MXNB (ARB)",
        color: "#00ff44",
        symbol: "MXNB",
        address: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D",
        decimals: 6,
        icon: iconsBlockchain.mxnb,
        coingecko: "mxnb",
      },
      {
        name: "USDC (ARB)",
        color: "#2775ca",
        symbol: "USDC",
        address: "0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1",
        decimals: 6,
        icon: iconsBlockchain.usdc,
        coingecko: "usd-coin",
      },
      {
        name: "Tether (ARB)",
        color: "#008e8e",
        symbol: "USDT",
        address: "0xE5b6C29411b3ad31C3613BbA0145293fC9957256",
        decimals: 6,
        icon: iconsBlockchain.usdt,
        coingecko: "tether",
      },
      {
        name: "Wrapped ETH (ARB)",
        color: "#ffffff",
        symbol: "WETH",
        address: "0x2836ae2eA2c013acD38028fD0C77B92cccFa2EE4",
        decimals: 18,
        icon: iconsBlockchain.weth,
        coingecko: "weth",
      },
    ],
  },
];

export const chains = blockchains.filter((_, index) => index !== 1); // Remove Ethereum, high fees

export const baseWallets = Object.fromEntries(
  blockchains.map((x) => [x.apiname, { id: "", address: "" }])
);

// Cloud Account Credentials
export const CloudAccountController =
  "0x72b9EB24BFf9897faD10B3100D35CEE8eDF8E43b";
export const CloudPublicKeyEncryption = `
-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAtflt9yF4G1bPqTHtOch47UW9hkSi4u2EZDHYLLSKhGMwvHjajTM+
wcgxV8dlaTh1av/2dWb1EE3UMK0KF3CB3TZ4t/p+aQGhyfsGtBbXZuwZAd8CotTn
BLRckt6s3jPqDNR3XR9KbfXzFObNafXYzP9vCGQPdJQzuTSdx5mWcPpK147QfQbR
K0gmiDABYJMMUos8qaiKVQmSAwyg6Lce8x+mWvFAZD0PvaTNwYqcY6maIztT6h/W
mfQHzt9Z0nwQ7gv31KCw0Tlh7n7rMnDbr70+QVd8e3qMEgDYnx7Jm4BzHjr56IvC
g5atj1oLBlgH6N/9aUIlP5gkw89O3hYJ0QIDAQAB
-----END RSA PUBLIC KEY-----
`;
