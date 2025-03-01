import { defineChain } from "thirdweb";

export const torusTestnet = defineChain({
  id: 8194,
  name: "Torus Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Torus Ether",
    symbol: "TTQF",
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.toruschain.com/"] },
  },
  blockExplorers: {
    default: { name: "Torus Explorer", url: "https://testnet.toruscan.com/" },
  },
  testnet: true,
});

export const torusMainnet = defineChain({
  id: 8192,
  name: "Torus Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Torus Ether",
    symbol: "TQF",
  },
  rpcUrls: {
    default: { http: ["https://rpc.toruschain.com/"] },
  },
  blockExplorers: {
    default: { name: "Torus Explorer", url: "https://toruscan.com" },
  },
  testnet: false,
});
