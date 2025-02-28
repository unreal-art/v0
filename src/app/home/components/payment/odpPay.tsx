interface OdpPayProps {
    amount: number;
    handleClose: () => void;
}

export default function OdpPay({ amount, handleClose }: OdpPayProps) {

    return (
        <div className='embedded-pay'>

            <form method="post" className="bg-[#232323] p-4 rounded-lg">

                <div className="flex flex-col gap-1 text-primary-8">

                    <label>Connected Wallet Address</label>
                    
                    <input
                        type="text"
                        placeholder="0"
                        value={'0xA1b2C3d4E5F6g7H8i9J0K1L2M3N4O5P6Q7R8S9T0'}
                        className="text-sm text-primary-7 bg-inherit left-0 top-0 w-full h-14 px-2 rounded-lg border-primary-10 border-[1px]" />

                    <label>Token type</label>
                    
                    <input
                        type="text"
                        placeholder="0"
                        value={'ODP'}
                        disabled
                        className="text-sm text-primary-1 bg-inherit left-0 top-0 w-full h-14 px-2 rounded-lg border-primary-10 border-[1px] outline-none" />

                    <label>Amount</label>
                    
                    <input
                        type="text"
                        placeholder="0"
                        value={amount}
                        className="text-sm text-primary-7 bg-inherit left-0 top-0 w-full h-14 px-2 rounded-lg border-primary-10 border-[1px] outline-none" />

                </div>

            </form>

            <div className="flex justify-end h-12 my-4 text-primary-6 gap-4">
                
                <button onClick={handleClose} className="border-primary-10 w-40 border-[1px] rounded-full">
                    Cancel
                </button>

                <button className="bg-primary-6 w-40 rounded-full hover:bg-primary-5 text-primary-13">
                    Confirm & Pay
                </button>

            </div>

        </div>
    );
}
