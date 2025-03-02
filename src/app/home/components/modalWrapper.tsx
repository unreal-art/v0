import { ReactNode } from "react";
import { CloseIcon } from "../../components/icons";


interface ModalWrapperProps {
    title: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    children: ReactNode;
    titleColor?: string;
}

export default function ModalWrapper({ open, title, titleColor, children, setOpen }: ModalWrapperProps) {

    const handleClose = () => {
        setOpen(false);
    };

    if (!open) return;
    return (
        <>
            <div
                onClick={handleClose}
                className="fixed z-30 top-0 left-0 h-screen w-full shadow-bg"></div>

            <div className="absolute flex justify-center items-center z-30 top-0 left-0 h-screen w-full">

                <div
                    onClick={handleClose}
                    className="absolute z-30 top-0 left-0 h-screen w-full shadow-bg"></div>

                <div className="absolute z-50 rounded-[20px] border-primary-8 border-[1px] p-6 bg-primary-12 w-[520px] flex flex-col">

                    <div className="flex justify-between mb-6">
                        <p style={{color: titleColor}} className="text-2xl text-primary-3 nasalization">{title}</p>
                        <button onClick={handleClose}>
                            <CloseIcon width={24} height={24} color="#F5F5F5" />
                        </button>
                    </div>

                    <div>{children}</div>

                </div>

            </div>

        </>
    );
}
