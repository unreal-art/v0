"use client";
import { torusMainnet, torusTestnet } from "$/constants/chains";
import { getContractInstance, logError } from "@/utils";
import appConfig from "@/config";
import WalletButton from "@/app/components/walletButton";
import { useUser } from "@/hooks/useUser";
import { BigNumberish, formatEther, parseEther, parseUnits } from "ethers";
import { useEffect, useState } from "react";
import { prepareContractCall } from "thirdweb";
import {
  useActiveAccount,
  useReadContract,
  useSendAndConfirmTransaction,
  useWalletInfo,
  useActiveWalletChain,
} from "thirdweb/react";
import { toast } from "sonner";
import { axiosInstanceLocal } from "@/lib/axiosInstance";
import { useTokenTransfer } from "@/hooks/useTokenTransfer";
import { createTokenSignature } from "@/utils/createTokenSignature";

interface MintPaymentProps {
  postId: number;
  handleClose: () => void;
  onMintSuccess: () => void;
}

// ODP contract instance using the appropriate network
const odpContract = getContractInstance(
  appConfig.environment.isDevelopment ? torusTestnet : torusMainnet,
  appConfig.environment.isDevelopment
    ? appConfig.blockchain.contracts.odpTestnet
    : appConfig.blockchain.contracts.odpMainnet
);

// Mint price constant in ODP
const MINT_PRICE = 500;

export default function MintPayment({
  postId,
  handleClose,
  onMintSuccess,
}: MintPaymentProps) {
  const [status, setStatus] = useState<
    "ready" | "processing" | "success" | "error"
  >("ready");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Get the active wallet account and wallet chain
  const account = useActiveAccount();
  const walletChain = useActiveWalletChain();
  // Simply check if account exists to determine if user is logged in
  const isLoggedIn = !!account;
  const { user } = useUser();

  // Token transfer hook
  const tokenTransfer = useTokenTransfer();
  const isTransferring = tokenTransfer.isPending;

  // Read ODP balance
  const { data: balance } = useReadContract({
    contract: odpContract,
    method: "function balanceOf(address) returns (uint256)",
    params: [account?.address || '0x0000000000000000000000000000000000000000'] as const,
  });

  // Format ODP balance for display
  const odpBalance = balance ? Number(formatEther(balance)) : 0;
  
  // Function to handle the mint transaction
  const handleMint = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }
    
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }
    
    // Check if user has enough ODP
    if (odpBalance < MINT_PRICE) {
      toast.error(`You need at least ${MINT_PRICE} ODP to mint a post`);
      return;
    }
    
    // Set status to processing
    setStatus("processing");
    
    try {
      // Using treasury as the recipient wallet
      const treasuryAddress = appConfig.blockchain.contracts.treasury;
      
      if (!treasuryAddress) {
        throw new Error("Treasury wallet address not configured");
      }
      
      const chainId = walletChain?.id || (appConfig.environment.isDevelopment ? torusTestnet.id : torusMainnet.id);
      const odpAddress = appConfig.environment.isDevelopment ? 
        (process.env.UNREAL_CHAIN === "torusMainnet" ? appConfig.blockchain.contracts.odpMainnet : appConfig.blockchain.contracts.odpTestnet) : 
        appConfig.blockchain.contracts.odpMainnet;
      
      // Create deadline 1 hour from now
      const deadline = Math.floor(Date.now() / 1000) + 60 * 60;
      
      if (!account.address) {
        throw new Error("Wallet address not available");
      }

      // Create token signature
      const signature = await createTokenSignature(
        account, // Pass the wallet object as first parameter
        {
          owner: account.address,
          spender: appConfig.blockchain.contracts.spender,
          value: parseEther(MINT_PRICE.toString()).toString(),
          deadline: deadline.toString(),
          tokenAddress: odpAddress,
          chainId,
        }
      );
      
      if (!signature) {
        throw new Error("Failed to create signature");
      }
      
      // Use token transfer API
      const transferResult = await tokenTransfer.mutateAsync({
        owner: account.address,
        signature,
        value: parseEther(MINT_PRICE.toString()).toString(),
        deadline,
        spender: appConfig.blockchain.contracts.spender,
        partnerwallet: treasuryAddress,
        vendor: "mint",
      });
      
      if (transferResult.success && transferResult.data?.transactionhash) {
        // Send the transaction data to the API
        await axiosInstanceLocal.post("/api/mint", {
          postId,
          userId: user.id,
          transactionHash: transferResult.data.transactionhash,
          amount: MINT_PRICE,
          chain: chainId,
        });
        
        // Set success status
        setStatus("success");
        toast.success("Post minted successfully!");
        
        // Close the modal and trigger the success callback
        setTimeout(() => {
          handleClose();
          onMintSuccess();
        }, 2000);
      } else {
        throw new Error(transferResult.error?.message || "Token transfer failed");
      }
    } catch (error: any) {
      console.error("Mint error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to mint post");
      logError("Mint transaction error", error);
      toast.error("Failed to mint post");
    }
  };

  // Render different content based on status
  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-3"></div>
        <p className="text-primary-3 mt-4">Processing your transaction...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </div>
        <p className="text-primary-3 text-xl font-bold">Success!</p>
        <p className="text-primary-5 mt-2">
          Your post has been minted successfully.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
          </svg>
        </div>
        <p className="text-primary-3 text-xl font-bold">Transaction Failed</p>
        <p className="text-primary-5 mt-2 mb-4">
          {errorMessage || "There was an error processing your transaction."}
        </p>
        <button
          onClick={() => setStatus("ready")}
          className="bg-primary-11 px-6 py-2 rounded-full hover:bg-primary-10"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <p className="text-primary-3 mb-2">Mint Post with ODP</p>
        <p className="text-primary-7 text-sm">
          Connect your wallet and pay {MINT_PRICE} ODP to mint this post.
          Minted posts will appear in your profile.
        </p>
      </div>

      {/* Wallet connection section */}
      {!isLoggedIn ? (
        <div className="flex flex-col items-center py-4">
          <p className="text-primary-5 mb-4">Connect your wallet to continue</p>
          <WalletButton />
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex justify-between items-center p-4 bg-primary-10 rounded-lg mb-4">
            <span className="text-primary-5">Mint Price</span>
            <span className="text-primary-3 font-bold">{MINT_PRICE} ODP</span>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-primary-10 rounded-lg mb-6">
            <span className="text-primary-5">Your Balance</span>
            <span className={`font-bold ${odpBalance < MINT_PRICE ? 'text-red-500' : 'text-green-500'}`}>
              {odpBalance.toFixed(2)} ODP
            </span>
          </div>

          <button
            onClick={handleMint}
            disabled={odpBalance < MINT_PRICE || isTransferring}
            className={`w-full py-3 rounded-full font-medium ${
              odpBalance < MINT_PRICE || isTransferring
                ? "bg-primary-8 text-primary-6 cursor-not-allowed"
                : "bg-primary-11 text-primary-1 hover:bg-primary-10"
            }`}
          >
            {isTransferring ? "Processing..." : "Mint Post"}
          </button>
        </div>
      )}
    </div>
  );
}
