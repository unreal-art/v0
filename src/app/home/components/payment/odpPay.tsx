"use client";
import { torusTestnet } from "$/constants/chains";
import { getContractInstance } from "@/utils";
import WalletButton from "@/app/components/walletButton";
import { useUser } from "@/hooks/useUser";
import { parseEther } from "ethers";
import { useEffect, useState } from "react";
import { prepareContractCall } from "thirdweb";
import { useActiveAccount, useSendAndConfirmTransaction } from "thirdweb/react";
import PaymentStatus from "./status";
import { toast } from "sonner";
import { setMaxListeners } from "stream";

interface OdpPayProps {
  amount: number;
  handleClose: () => void;
}
const odpContract = getContractInstance(
  torusTestnet,
  process.env.NEXT_PUBLIC_ODP_ADDRESS as string,
);

const exchangeContract = getContractInstance(
  torusTestnet,
  process.env.NEXT_PUBLIC_EXCHANGE_ADDRESS as string,
);

export default function OdpPay({ amount, handleClose }: OdpPayProps) {
  const activeAccount = useActiveAccount();
  const [mainLoadingState, setMainLoadingState] = useState(false);
  const [mainTransaction, setMainTransaction] = useState<boolean>(false);

  const { user } = useUser();
  const { mutate: approveTransaction, isPending: approveLoading } =
    useSendAndConfirmTransaction();

  const { mutate: swapTransaction, isPending: swapLoading } =
    useSendAndConfirmTransaction();

  const swapTokens = () => {
    try {
      console.log("Swapping tokens...");

      if (!user?.wallet?.address || !amount) {
        console.error("Missing wallet address or amount");
        return;
      }

      const parsedAmount = parseEther(amount.toString());

      const transaction = prepareContractCall({
        contract: exchangeContract,
        method: "function exchange(uint256 odpAmount, address receiver)",
        params: [parsedAmount, user.wallet.address],
      });

      swapTransaction(transaction, {
        onSuccess: () => {
          console.log("Swap successful");
          setMainLoadingState(false);
          // show success modal
        },
        onError: (error) => {
          toast.error("Swap failed:");
          setMainLoadingState(false);
          setMainTransaction(false);
        },
      });
    } catch (error) {
      toast.error("Swap failed:");
      setMainLoadingState(false);
      setMainTransaction(false);
    }
  };

  const completePayment = () => {
    setMainLoadingState(true);
    setMainTransaction(true);
    const transaction = prepareContractCall({
      contract: odpContract,
      method:
        "function approve(address spender, uint256 value) external returns (bool)",
      params: [
        process.env.NEXT_PUBLIC_EXCHANGE_ADDRESS as string,
        parseEther(amount.toString()),
      ],
    });
    approveTransaction(transaction, {
      onSuccess: () => {
        console.log("Approved");
        swapTokens();
      },
      onError: (error) => {
        toast.error("Approval failed:");
        setMainLoadingState(false);
        setMainTransaction(false);
      },
    });
  };

  useEffect(() => {
    if (swapLoading || approveLoading) {
      console.log(approveLoading, swapLoading);
      //show loading modal
    }
  }, [swapLoading, approveLoading]);

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
          onClick={completePayment}
        >
          Confirm & Pay
        </button>
      </div>
    </>
  );
}
