"use client";

import { BackIcon, CloseIcon } from "../../../components/icons";
import MintPayment from "./MintPayment";

interface MintModalProps {
  open: boolean;
  postId: number;
  setOpen: (open: boolean) => void;
  onMintSuccess: () => void;
}

export default function MintModal({
  open,
  postId,
  setOpen,
  onMintSuccess,
}: MintModalProps) {
  const handleClose = () => setOpen(false);
  if (!open) return null;

  return (
    <>
      <div
        onClick={handleClose}
        className="fixed z-30 top-0 left-0 h-screen w-full shadow-bg"
      />
      <div className="absolute flex justify-center items-center z-30 top-0 left-0 h-screen w-full">
        <div
          onClick={handleClose}
          className="absolute z-30 top-0 left-0 h-screen w-full"
        />
        <div className="absolute z-50 rounded-[20px] border-primary-8 border-[1px] p-6 bg-primary-12 w-[98%] max-w-[460px] flex flex-col">
          <div className="flex justify-between">
            <button onClick={handleClose}>
              <BackIcon width={24} height={24} color="#F5F5F5" />
            </button>
            <p className="text-2xl text-primary-3 nasalization">Mint Post</p>
            <button onClick={handleClose}>
              <CloseIcon width={24} height={24} color="#F5F5F5" />
            </button>
          </div>
          <div className="mt-6 h-full">
            <MintPayment
              postId={postId}
              handleClose={handleClose}
              onMintSuccess={onMintSuccess}
            />
          </div>
        </div>
      </div>
    </>
  );
}
