import { useEffect, useState } from "react";
import { CloseIcon, FlashIcon } from "../components/icons";
import Payment from "../home/components/payment";
import { formatMoney, getContractInstance } from "@/utils";
import { torusMainnet, torusTestnet } from "$/constants/chains";
import { useReadContract } from "thirdweb/react";
import { BigNumberish, formatEther } from "ethers";
import appConfig from "@/config";

interface TopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  refetch: () => void;
}

// const exchangeContract = getContractInstance(
//   torusTestnet,
//   appConfig.blockchain.contracts.exchange,
// );

export default function Topup({ open, setOpen, refetch }: TopupProps) {
  const [credit, setCredit] = useState<number>(5);
  const [amount, setAmount] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  // const [rate, setRate] = useState<number>(
  //   Number(formatEther(appConfig.blockchain.tokenRates.odp || "0"))
  // );
  type Token = "USDT" | "USDC" | "ODP";
  const [selectedToken, setSelectedToken] = useState<Token>("ODP");
  const [tokenRates, setTokenRates] = useState<Record<Token, number>>({
    USDT: Number(formatEther(appConfig.blockchain.rates.stableCoin || "0")),
    USDC: Number(formatEther(appConfig.blockchain.rates.stableCoin || "0")),
    ODP: Number(formatEther(appConfig.blockchain.rates.odp || "0")),
  });

  const [openPayment, setOpenPayment] = useState(false);

  // const { data: exchangeRate } = useReadContract({
  //   contract: exchangeContract,
  //   method: "function rate() returns (uint256)",
  //   // params: [credit],
  // });

  // useEffect(() => {
  //   if (exchangeRate) {
  //     setRate(Number(formatEther(exchangeRate)));
  //   }
  // }, [exchangeRate]);

  useEffect(() => {
    // console.log(Number(credit) * tokenRates[selectedToken]);
    setCost(Number(credit) * tokenRates[selectedToken]);
    setAmount(Number(credit));
  }, [credit, selectedToken]);

  const handleClose = () => {
    setOpen(false);
    setOpenPayment(false);
  };

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Math.floor(Number(e.target.value)); // Ensure it's a whole number
    setCredit(value);
    // if (selectedToken === "ODP" && value >= 5) {
    //   setCredit(value);
    // } else if (selectedToken !== "ODP" && value >= 0) {
    //   setCredit(value);
    // } else {
    //   setCredit(0);
    // }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  if (!open) return;
  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed z-30 top-0 left-0 h-screen w-full ${
          !openPayment ? "shadow-bg" : ""
        }`}
      ></div>

      <div className="absolute flex justify-center items-center z-30 top-0 left-0 h-screen w-full">
        <div
          onClick={handleClose}
          className={"absolute z-30 top-0 left-0 h-screen w-full"}
        ></div>

        <div className="absolute z-50 rounded-[20px] border-primary-8 border-[1px] p-6 bg-primary-12 h-[500px] w-[98p%] max-w-[520px] flex flex-col">
          <div className="flex justify-between">
            <p className="text-2xl text-primary-3 nasalization">Top up</p>
            <button onClick={handleClose}>
              <CloseIcon width={24} height={24} color="#F5F5F5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} method="post" className="">
            <div className="text-primary-2 my-10">
              {/* select with options of usdt, usdc and odp */}
              <label className="text-xs">
                Minimum credit (ODP = 5, others = 1)
              </label>

              <div className="flex flex-col gap-4">
                <div className="relative h-14 w-full rounded-xl bg-primary-10 ">
                  <select
                    value={selectedToken}
                    onChange={(e) => {
                      const newToken = e.target.value as Token;
                      setSelectedToken(newToken);
                      setCost(
                        Math.round(Number(credit) * tokenRates[newToken]),
                      );
                    }}
                    className="absolute text-primary-3 bg-inherit cursor-pointer left-0 top-0 w-full h-14 px-2  rounded-lg border-[1px] border-primary-11 border-none focus:outline-none focus:ring-0"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="ODP">ODP</option>
                  </select>
                </div>

                <div className="relative h-14 w-full rounded-xl bg-primary-10">
                  <button className="absolute top-[18px] right-3 z-10">
                    <FlashIcon width={20} height={20} color="#8F8F8F" />
                  </button>

                  <input
                    type="number"
                    placeholder="0 (minimum value of 2)"
                    value={credit}
                    step={1}
                    onChange={(e) => {
                      handleCreditChange(e);
                      setCost(
                        Math.round(
                          Number(e.target.value) * tokenRates[selectedToken],
                        ),
                      );
                    }}
                    className="absolute text-primary-3 placeholder:text-primary-6 bg-inherit left-0 top-0 w-full h-14 px-2 rounded-lg border-[1px] border-primary-11 border-none focus:outline-none focus:ring-0 hide-arrow"
                  />
                </div>
              </div>
              <p className="text-primary-7">
                {formatMoney(credit)} credit = {formatMoney(amount)} AI image
              </p>
            </div>

            <div className="flex justify-between h-11 my-10">
              <p className="text-primary-6">Amount</p>{" "}
              <p className="text-primary-3 text-xl flex space-x-2">
                <span className="">{selectedToken}</span>{" "}
                <span>{formatMoney(cost)}</span>
              </p>
            </div>

            <div className="flex justify-end h-12 my-10 text-primary-6 gap-4">
              <button
                onClick={handleClose}
                className="border-primary-10 w-40 border-[1px] rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={() => setOpenPayment(true)}
                className="bg-primary-11 w-40 rounded-full hover:bg-primary-10"
                disabled={
                  (selectedToken === "ODP" && credit < 5) ||
                  (selectedToken !== "ODP" && credit < 1)
                }
              >
                Proceed
              </button>
            </div>
          </form>
        </div>
      </div>

      <Payment
        token={selectedToken}
        amount={cost}
        open={openPayment}
        close={handleClose}
        setOpen={setOpenPayment}
        refetch={refetch}
      />
    </>
  );
}
