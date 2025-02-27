import { useEffect, useState } from "react";
import { CloseIcon, FlashIcon } from "../components/icons";

interface TopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Topup({open, setOpen }: TopupProps) {


  const [credit, setCredit] = useState<number | string>()
  const [amount, setAmount] = useState<number>(0)
  const [cost, setCost] = useState<number>(0)

  useEffect(() => {
    const price = Number(credit) || 0
    setAmount(price)
    setCost(price * 0.5)
  }, [credit])


  const handleClose = () => {
    setOpen(false)
  }

  if (!open) return;
  return (
    <>

      <div onClick={handleClose} className="fixed z-30 top-0 left-0 h-screen w-full shadow-bg"></div>

      <div className="absolute flex justify-center items-center z-30 top-0 left-0 h-screen w-full">

        <div onClick={handleClose} className="absolute z-30 top-0 left-0 h-screen w-full shadow-bg"></div>

        <div className="absolute z-50 rounded-[20px] border-primary-8 border-[1px] p-6 bg-primary-12 h-[394px] w-[520px] flex flex-col">
          
          <div className="flex justify-between">
            <p className="text-2xl text-primary-3 nasalization">Top up</p>
            <button onClick={handleClose}><CloseIcon width={24} height={24} color="#F5F5F5" /></button>
          </div>

          <form method="post" className="">

            <div className="text-primary-2 my-10">
              <label>Number of credits</label>
              <div>
                <div className="relative h-14 w-full rounded-xl bg-primary-10">

                  <button className="absolute top-[18px] right-3 z-10">
                    <FlashIcon width={20} height={20} color="#8F8F8F" />
                  </button>
  
                  <input
                    type="number"
                    placeholder="0"
                    value={credit}
                    onChange={(e) => setCredit(Number(e.target.value) || "")}
                    className="absolute text-primary-3 placeholder:text-primary-6 bg-inherit left-0 top-0 w-full h-14 px-2 rounded-lg border-[1px] border-primary-11 border-none focus:outline-none focus:ring-0 hide-arrow"
                  />
                </div>
              </div>
              <p className="text-primary-7">{credit} credit = {amount} AI image</p>
            </div>

            <div className="flex justify-between h-11 my-10">
              <p className="text-primary-6">Amount</p> <p className="text-primary-3 text-xl">${cost}</p>
            </div>

            <div className="flex justify-end h-12 my-10 text-primary-6 gap-4">
              <button onClick={handleClose} className="border-primary-10 w-40 border-[1px] rounded-full">
                Cancel
              </button>
              <button className="bg-primary-11 w-40 rounded-full hover:bg-primary-10">
                Proceed
              </button>
            </div>

          </form>
          
        </div>

      </div>

    </>
  );
}
