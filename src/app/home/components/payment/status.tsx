import { VerifiedCircleIcon } from '@/app/components/icons';
import { RotatingLines } from 'react-loader-spinner'

interface PaymentStatusProps {
    isLoading: boolean;
    handleClose: () => void;
}

export default function PaymentStatus({ isLoading, handleClose }: PaymentStatusProps) {

    return (
        <>

            <div onClick={handleClose} className={"fixed  top-0 left-0 h-screen w-screen shadow-bg"}></div>

            <div className="fixed top-0 left-0 w-screen h-screen">

                <div className="absolute flex justify-center items-center z-30 top-0 left-0 h-screen w-screen">

                    <div className="absolute z-50 rounded-[20px] border-primary-8 border-[1px] p-6 w-[400px] flex flex-col items-center bg-primary-12">

                        {
                            isLoading &&
                                <>

                                    <RotatingLines
                                        visible={true}
                                        width="100"
                                        strokeWidth="3"
                                        animationDuration="0.75"
                                        strokeColor='#FFFFFF'
                                        ariaLabel="rotating-lines-loading"/>
                                
                                    <p className="text-primary-3 nasalization text-2xl text-center mt-8 mb-4">Transaction Processing...</p>

                                    <p className="text-sm text-primary-6 text-center">Kindly wait as we process your transaction</p>

                                </>
                        }

                        {
                            !isLoading &&
                                <>

                                    <VerifiedCircleIcon width={120} height={120} color='#FDFDFD' />

                                    <p className="text-primary-3 nasalization text-2xl text-center mt-8 mb-4">Transaction successful</p>

                                    <p className="text-sm text-primary-6 text-center">Time to unleash your creativity and generate something Unreal!</p>

                                    <button
                                        onClick={handleClose}
                                        className="bg-primary-6 w-40 rounded-full hover:bg-primary-5 text-primary-13 h-12 mt-6">
                                        Start Creating
                                    </button>

                                </>
                        }
                    
                    </div>

                </div>

            </div>

        </>
    );
}
