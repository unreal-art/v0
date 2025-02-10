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
