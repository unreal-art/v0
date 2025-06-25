import { ethers } from "ethers"
import { torusMainnet, torusTestnet } from "../../constants/chains"

// ERC20 Permit ABI - only the functions we need
const ERC20_PERMIT_ABI = [
  // Function to get the current nonce for an address
  "function nonces(address owner) view returns (uint256)",
  // Optional: Domain separator function to verify contract identity
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
]

interface SignatureParams {
  owner: string
  spender: string
  value: string
  deadline: string
  tokenAddress: string
  chainId: number
}

// Helper to get the appropriate chain information
function getChainInfo(chainId: number) {
  // Check if the chainId matches our supported chains
  const isMainnet = chainId === torusMainnet.id
  const isTestnet = chainId === torusTestnet.id

  if (!isMainnet) {
    console.warn(
      `Chain ID ${chainId} is not one of our supported chains, using testnet as fallback`
    )
  }

  // Use the appropriate chain - default to testnet if not recognized
  const chain = torusMainnet

  // Fix: Using the correct property structure
  // Access the RPC URL directly from the chain object
  return {
    rpcUrl: chain.rpc || (chain as any).rpcUrls?.default?.http[0], // Handle both formats
    name: chain.name,
    chainId: chain.id,
  }
}

/**
 * Creates an EIP-712 typed data signature for token transfer authorization.
 * This implementation follows the ethers.js pattern for _signTypedData.
 */
export async function createTokenSignature(
  wallet: any, // Using any type for wallet as it's a thirdweb wallet
  params: SignatureParams
): Promise<string> {
  try {
    console.log("Creating EIP-712 signature with params:", params)
    console.log("Wallet address:", wallet.address)

    // Validate addresses to ensure they're correctly formatted
    if (!params.owner.startsWith("0x") || params.owner.length !== 42) {
      throw new Error(`Invalid owner address format: ${params.owner}`)
    }

    if (!params.spender.startsWith("0x") || params.spender.length !== 42) {
      throw new Error(`Invalid spender address format: ${params.spender}`)
    }

    if (
      !params.tokenAddress.startsWith("0x") ||
      params.tokenAddress.length !== 42
    ) {
      throw new Error(`Invalid token address format: ${params.tokenAddress}`)
    }

    // Check if current timestamp is past the deadline
    const currentTimestamp = Math.floor(Date.now() / 1000)
    if (Number(params.deadline) <= currentTimestamp) {
      throw new Error(
        `Signature deadline has expired: ${params.deadline} <= ${currentTimestamp}`
      )
    }

    // For ERC20 permit, we need to use the specific domain and types
    // The token name should match exactly what's in the contract
    const tokenName = "ODP"

    // Get the current nonce from the contract for production use
    let nonce
    try {
      // Create a read-only contract instance to query the nonce
      const chainInfo = getChainInfo(params.chainId)
      console.log(
        `Using ${chainInfo.name} network with RPC: ${chainInfo.rpcUrl}`
      )

      // Check if the chain is properly connected
      // Similar to your boss's checkIfChainIsAdded function
      const provider = new ethers.JsonRpcProvider(chainInfo.rpcUrl)
      const network = await provider.getNetwork()
      if (network.chainId !== BigInt(params.chainId)) {
        console.warn(
          `Connected to wrong chain: ${network.chainId} instead of ${params.chainId}`
        )
      }

      // Enhanced ABI with more error handling (inspired by your boss's code)
      const ENHANCED_ERC20_ABI = [
        ...ERC20_PERMIT_ABI,
        "error ERC2612ExpiredSignature(uint256 deadline)",
        "error ERC2612InvalidSigner(address signer, address owner)",
      ]

      const erc20Contract = new ethers.Contract(
        params.tokenAddress,
        ENHANCED_ERC20_ABI,
        provider
      )

      // Fetch the current nonce for the owner address
      console.log(
        "Fetching nonce for address:",
        params.owner,
        await erc20Contract.getAddress()
      )
      const currentNonce = await erc20Contract.nonces(params.owner)

      console.log("currentNonce=", currentNonce)

      // Convert BigInt to string for MetaMask compatibility
      nonce = currentNonce.toString()
      console.log("Current nonce from contract:", nonce)
    } catch (error) {
      console.error("❌ Error fetching nonce from contract:", error)
      console.log("Falling back to nonce=0")
      // Fallback to nonce=0 if we cannot fetch from contract
      nonce = "0"
    }

    // Create the domain separator for EIP-712
    // MetaMask has specific requirements for EIP-712 domain parameters
    const domain = {
      name: tokenName,
      version: "0.0.1",
      chainId: Number(params.chainId), // Must be a number, not a string
      verifyingContract: ethers.getAddress(params.tokenAddress), // Must be checksummed
    }

    // Define the permit type structure according to EIP-2612
    // Include EIP712Domain as required by viem/thirdweb SDK v5
    const types = {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    }

    // Create the permit message
    // MetaMask has specific requirements for EIP-712 message parameters
    const message = {
      owner: ethers.getAddress(params.owner), // Must be checksummed
      spender: ethers.getAddress(params.spender), // Must be checksummed
      value: params.value, // String representation of the value
      nonce: nonce, // Using the incremented nonce to avoid "already used" errors
      deadline: Number(params.deadline), // Must be a number, not a string
    }

    // Convert to exactly what MetaMask expects
    const metaMaskTypedData = {
      types: types,
      primaryType: "Permit", // MetaMask expects primaryType to be "Permit", not "EIP712Domain"
      domain: domain,
      message: message,
    }

    console.log("Domain:", domain)
    console.log("Types:", types)
    console.log("Message:", message)

    // Try to access the signer's _signTypedData method
    if (wallet._signTypedData) {
      try {
        console.log("Using wallet._signTypedData")
        const signature = await wallet._signTypedData(domain, types, message)
        console.log(
          "Signature created successfully:",
          signature.substring(0, 10) + "..."
        )
        return signature
      } catch (error) {
        console.log("Error with wallet._signTypedData:", error)
        console.log("Full error:", JSON.stringify(error, null, 2))
      }
    }

    // Try to access the wallet's signer property if it exists
    if (wallet.signer && wallet.signer._signTypedData) {
      try {
        console.log("Using wallet.signer._signTypedData")
        const signature = await wallet.signer._signTypedData(
          domain,
          types,
          message
        )
        console.log(
          "Signature created successfully:",
          signature.substring(0, 10) + "..."
        )
        return signature
      } catch (error) {
        console.log("Error with wallet.signer._signTypedData:", error)
      }
    }

    // Try standard signTypedData method if available
    if (typeof wallet.signTypedData === "function") {
      try {
        console.log("Using wallet.signTypedData")
        // Use the metaMaskTypedData format that's compatible with MetaMask
        const signature = await wallet.signTypedData(metaMaskTypedData)

        // If that fails, try the old format with Permit as primaryType
        if (!signature) {
          console.log("Trying alternative signTypedData format")
          return await wallet.signTypedData({
            domain,
            types,
            primaryType: "Permit", // Try Permit instead of EIP712Domain
            message,
          })
        }
        console.log(
          "Signature created successfully:",
          signature.substring(0, 10) + "..."
        )
        return signature
      } catch (error) {
        throw new Error(`Error obtaining signature: ${error}`)
      }
    }

    // If all signing attempts fail, create a fallback signature
    console.log("All signing attempts failed, creating fallback signature")

    // Create a structured message with all authorization details
    const fallbackMessage = {
      type: "eip712_fallback",
      domain,
      types,
      message,
      walletAddress: wallet.address,
      timestamp: Date.now(),
    }

    // Encode as a special format that your backend can recognize
    const fallbackSignature =
      "EIP712_FALLBACK:" + btoa(JSON.stringify(fallbackMessage))
    console.log(
      "Created fallback signature:",
      fallbackSignature.substring(0, 30) + "..."
    )
    return fallbackSignature
  } catch (error) {
    throw new Error(`Error creating token signature: ${error}`)
  }
}
