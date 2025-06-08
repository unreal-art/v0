"use client";
import { useEffect, useState } from "react";
import { BackIcon, CloseIcon, FlashIcon } from "../../../components/icons";
import OdpPay from "./odpPay";

interface TopupProps {
  amount: number;
  open: boolean;
  token: string;
  setOpen: (open: boolean) => void;
  close: () => void;
  refetch: () => void;
}

export default function Payment({
  open,
  amount,
  token,
  setOpen,
  close,
  refetch,
}: TopupProps) {
  const handleClose = () => {
    setOpen(false);
  };

  if (!open) return;

  return (
    <>
      <div
        onClick={handleClose}
        className={"fixed z-30 top-0 left-0 h-screen w-full shadow-bg"}
      ></div>

      <div className="absolute flex justify-center items-center z-30 top-0 left-0 h-screen w-full">
        <div
          onClick={handleClose}
          className="absolute z-30 top-0 left-0 h-screen w-full"
        ></div>

        <div className="absolute z-50 rounded-[20px] border-primary-8 border-[1px] p-6 bg-primary-12 w-[98%] max-w-[460px] flex flex-col">
          <div className="flex justify-between">
            <button onClick={handleClose}>
              <BackIcon width={24} height={24} color="#F5F5F5" />
            </button>

            <p className="text-2xl text-primary-3 nasalization">
              Payment method
            </p>

            <button onClick={close}>
              <CloseIcon width={24} height={24} color="#F5F5F5" />
            </button>
          </div>

          <div className="mt-6 h-full">
            <OdpPay
              amount={amount}
              token={token}
              handleClose={handleClose}
              refetch={refetch}
            />
          </div>
        </div>
      </div>
    </>
  );
}
