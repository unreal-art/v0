"use client";
import { torusMainnet, torusTestnet } from "$/constants/chains";
import { getContractInstance, logError } from "@/utils";
import WalletButton from "@/app/components/walletButton";
import { useUser } from "@/hooks/useUser";
import { BigNumberish, formatEther, parseEther, parseUnits } from "ethers";
import { act, useEffect, useState } from "react";
import { prepareContractCall, PreparedTransaction } from "thirdweb";
import {
  useActiveAccount,
  useReadContract,
  useSendAndConfirmTransaction,
  useWalletInfo,
} from "thirdweb/react";
import PaymentStatus from "./status";
import { toast } from "sonner";
import { setMaxListeners } from "stream";
import { transform } from "framer-motion";
import { axiosInstanceLocal } from "@/lib/axiosInstance";
import { chain } from "lodash";
import { getChainId } from "thirdweb/extensions/multicall3";
import { useActiveWalletChain } from "thirdweb/react";
import { createTokenSignature } from "@/utils/createTokenSignature";

import { useTokenTransfer } from "@/hooks/useTokenTransfer";

interface OdpPayProps {
  amount: number;
  handleClose: () => void;
  refetch: () => void;
}
const defaultOdpContract = getContractInstance(
  process.env.NODE_ENV === "development" ? torusTestnet : torusMainnet,
  process.env.NODE_ENV == "development"
    ? (process.env.NEXT_PUBLIC_ODP_ADDRESS_TESTNET as string)
    : (process.env.NEXT_PUBLIC_ODP_ADDRESS_MAINNET as string),
);

// const exchangeContract = getContractInstance(
//   torusTestnet,
//   process.env.NEXT_PUBLIC_EXCHANGE_ADDRESS as string,
// );

export default function OdpPay({ amount, handleClose, refetch }: OdpPayProps) {
  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const [mainLoadingState, setMainLoadingState] = useState(false);
  const [mainTransaction, setMainTransaction] = useState<boolean>(false);
  const [odpContract, setOdpContract] = useState<any | null>(null);

  const tokenTransfer = useTokenTransfer();

  const { user } = useUser();
  const { mutate: approveTransaction, isPending: approveLoading } =
    useSendAndConfirmTransaction();
  const { mutate: transferTransaction, isPending: transferLoading } =
    useSendAndConfirmTransaction();

  const { mutate: swapTransaction, isPending: swapLoading } =
    useSendAndConfirmTransaction();

  // const { data: balance } = useReadContract({
  //   contract: defaultOdpContract,
  //   method: "function balanceOf(address owner) returns (uint256)",
  //   params: [activeAccount?.address as string],
  // });

  // const swapTokens = () => {
  //   try {
  //     console.log("Swapping tokens...");

  //     if (!user?.wallet?.address || !amount) {
  //       console.error("Missing wallet address or amount");
  //       return;
  //     }

  //     const parsedAmount = parseEther(amount.toString());
  //     console.log(parsedAmount);

  //     const transaction = prepareContractCall({
  //       contract: exchangeContract,
  //       method: "function exchange(uint256 odpAmount, address receiver)",
  //       params: [parsedAmount, user.wallet.address],
  //     });

  //     swapTransaction(transaction, {
  //       onSuccess: () => {
  //         refetch(); //refetch dart balance
  //         setMainLoadingState(false);
  //         // show success modal
  //       },
  //       onError: (error) => {
  //         logError(error.message);
  //         toast.error("Swap failed:");
  //         setMainLoadingState(false);
  //         setMainTransaction(false);
  //       },
  //     });
  //   } catch (error) {
  //     toast.error("Swap failed:");
  //     setMainLoadingState(false);
  //     setMainTransaction(false);
  //   }
  // };

  // const verify = (transactionHash: string) => {
  //   const data = {
  //     txHash: transactionHash,
  //     tokenAddress:
  //       activeChain?.id == 8192
  //         ? (process.env.NEXT_PUBLIC_ODP_ADDRESS_MAINNET as string)
  //         : (process.env.NEXT_PUBLIC_ODP_ADDRESS_TESTNET as string),
  //     expectedFrom: activeAccount?.address,
  //     expectedTo: process.env.NEXT_PUBLIC_TREASURY as string,
  //     expectedAmount: amount.toString(), //amount paid
  //     decimals: 18,
  //     chainId: activeChain?.id,
  //   };

  //   axiosInstanceLocal
  //     .post("/api/bridge", data)
  //     .then(() => {
  //       // Trigger refetch only after the request was successful
  //       refetch();
  //       setMainLoadingState(false);
  //     })
  //     .catch((error) => {
  //       const errMsg =
  //         error.response?.data?.error?.message ||
  //         error.message ||
  //         "Payment confirmation failed";
  //       toast.error(" Error completing payment: " + errMsg);

  //       logError("Error sending job request", error);
  //       setMainLoadingState(false);
  //       setMainTransaction(false);
  //     });
  // };

  // const completePayment = () => {
  //   setMainLoadingState(true);
  //   setMainTransaction(true);
  //   const transaction = prepareContractCall({
  //     contract: odpContract,
  //     method:
  //       "function transfer(address recipient, uint256 amount) public returns (bool)",
  //     params: [
  //       process.env.NEXT_PUBLIC_TREASURY as string,
  //       parseEther(amount.toString()),
  //     ],
  //   });
  //   transferTransaction(transaction as PreparedTransaction, {
  //     onSuccess: (data) => {
  //       verify(data.transactionHash);
  //     },
  //     onError: (error) => {
  //       toast.error("Transaction failed:" + error.message);
  //       setMainLoadingState(false);
  //       setMainTransaction(false);
  //     },
  //   });
  //   // const transaction = prepareContractCall({
  //   //   contract: odpContract,
  //   //   method:
  //   //     "function approve(address spender, uint256 value) external returns (bool)",
  //   //   params: [
  //   //     process.env.NEXT_PUBLIC_EXCHANGE_ADDRESS as string,
  //   //     parseEther(amount.toString()),
  //   //   ],
  //   // });
  //   // approveTransaction(transaction, {
  //   //   onSuccess: () => {
  //   //     // console.log("Approved");
  //   //     swapTokens();
  //   //   },
  //   //   onError: (error) => {
  //   //     toast.error("Approval failed:");
  //   //     setMainLoadingState(false);
  //   //     setMainTransaction(false);
  //   //   },
  //   // });
  // };

  // useEffect(() => {
  //   if (swapLoading || approveLoading) {
  //     console.log(approveLoading, swapLoading);
  //     //show loading modal
  //   }
  // }, [swapLoading, approveLoading]);
  //

  useEffect(() => {
    if (!activeChain) return;

    const initContract = async () => {
      const isMainnet = activeChain.id == 8192;
      const contract = getContractInstance(
        isMainnet ? torusMainnet : torusTestnet,
        isMainnet
          ? (process.env.NEXT_PUBLIC_ODP_ADDRESS_MAINNET as string)
          : (process.env.NEXT_PUBLIC_ODP_ADDRESS_TESTNET as string),
      );
      setOdpContract(contract);
    };

    initContract();
  }, [activeChain]);

  const handleTransferTokens = async () => {
    if (!activeChain || !amount || !activeAccount) {
      toast.error("Missing required parameters. Please check your inputs.");
      return;
    }

    // if (Number(formatEther(balance)) < Number(amount)) {
    //   toast.error("Insufficient balance");
    //   return;
    // }

    try {
      setMainLoadingState(true);
      setMainTransaction(true);
      toast.loading("Creating signature...");

      // Convert amount to wei (assuming 18 decimals, adjust if different)
      const amountInWei = parseUnits(amount.toString(), 18).toString();

      // Create deadline (1 hour from now in seconds)
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + 3600;
      console.log(activeChain.id);
      // Create the signature using our utility function
      const signature = await createTokenSignature(activeAccount, {
        owner: activeAccount?.address as string,
        spender: process.env.NEXT_PUBLIC_SPENDER_ADDRESS as string,
        value: amountInWei,
        deadline: deadline.toString(), // Convert to string for compatibility
        tokenAddress: process.env.NEXT_PUBLIC_ODP_ADDRESS_MAINNET as string,
        chainId: activeChain.id,
      });

      toast.dismiss(); // Clear the loading toast

      // Use the React Query mutation to execute the API call
      toast.loading("Processing transfer...");

      tokenTransfer.mutate(
        {
          owner: activeAccount?.address as string,
          signature: signature,
          value: amountInWei,
          deadline: deadline,
          spender: process.env.NEXT_PUBLIC_SPENDER_ADDRESS as string,
          partnerwallet: process.env.NEXT_PUBLIC_TREASURY as string,
          vendor: "UNREAL",
        },
        {
          onSuccess: (data) => {
            refetch();
            setMainLoadingState(false);
            toast.dismiss(); // Clear the loading toast

            // Check if data has the expected structure
            if (data.success && data.data) {
              toast.success(
                data.data.transactionhash
                  ? `Transfer successful! Transaction: ${data.data.transactionhash.substring(0, 6)}...`
                  : "Transfer completed successfully",
              );
            } else {
              // Fallback message if data structure is unexpected
              toast.success("Transfer completed successfully");
            }
          },
          onError: (error: any) => {
            setMainLoadingState(false);
            setMainTransaction(false);
            toast.dismiss(); // Clear the loading toast

            // Handle structured API errors
            if (error.response?.data?.error) {
              const apiError = error.response.data.error;
              const errorMessage = apiError.details
                ? `${apiError.message}: ${apiError.details}`
                : apiError.message;
              toast.error(`Transfer failed: ${errorMessage}`);
            } else {
              // Fallback for network or other errors
              toast.error(
                `Transfer failed: ${error.message || "Unknown error"}`,
              );
            }
          },
        },
      );
    } catch (error: any) {
      setMainLoadingState(false);
      setMainTransaction(false);

      toast.dismiss(); // Clear any loading toasts
      toast.error(
        `Signature creation failed: ${error.message || "Unknown error"}`,
      );
    }
  };
  return (
    <>
      <div className="bg-[#232323] p-4 rounded-lg">
        {true && (
          <div className="flex flex-col gap-1 text-primary-8">
            {/* <label>Connected Wallet Address</label>

            <input
                type="text"
                placeholder="0"
                value={"0xA1b2C3d4E5F6g7H8i9J0K1L2M3N4O5P6Q7R8S9T0"}
                className="text-sm text-primary-7 bg-inherit left-0 top-0 w-full h-14 px-2 rounded-lg border-primary-10 border-[1px]"
            /> */}

            <WalletButton />

            <label>Token type</label>

            <input
              type="text"
              placeholder="0"
              value={"ODP"}
              disabled
              className="text-sm text-primary-1 bg-inherit left-0 top-0 w-full h-14 px-2 rounded-lg border-primary-10 border-[1px] outline-none"
            />

            <label>Amount</label>

            <input
              type="text"
              placeholder="0"
              disabled
              readOnly
              value={amount}
              className="text-sm text-primary-7 bg-inherit left-0 top-0 w-full h-14 px-2 rounded-lg border-primary-10 border-[1px] outline-none"
            />
          </div>
        )}

        {mainTransaction && (
          <PaymentStatus
            isLoading={mainLoadingState}
            handleClose={handleClose}
          />
        )}
      </div>

      <div className="flex justify-between h-12 my-4 text-primary-6 gap-4">
        <button
          onClick={handleClose}
          className="border-primary-10 w-40 border-[1px] rounded-full"
        >
          Cancel
        </button>

        <button
          className="bg-primary-6 w-40 rounded-full hover:bg-primary-5 text-primary-13"
          disabled={!activeAccount?.address || amount === 0}
          onClick={handleTransferTokens}
        >
          Confirm & Pay
        </button>
      </div>
    </>
  );
}
