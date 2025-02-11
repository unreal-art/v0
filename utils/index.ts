import { ethers } from "ethers";
// Function to generate Ethereum wallet
export const generateEthereumWallet = (): WalletObject => {
  // Generate Ethereum Wallet using ethers.js
  const wallet = ethers.Wallet.createRandom();

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
  };
};

// returns a range of numbers to be used for pagination.
export function getRange(page: number, limit: number) {
  const from = page * limit;
  const to = from + limit - 1;

  return [from, to];
}
