"use client";
import { ReactNode, useState } from "react";
import { FlashIcon, LogoutIcon, MoonIcon } from "../components/icons";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import Topup from "./topup";
import useAuthorImage from "@/hooks/useAuthorImage";
import Link from "next/link";
import { supabase } from "$/supabase/client";
import { useRouter } from "next/navigation";
import {
  formatDisplayName,
  getContractInstance,
  truncateEmail,
  truncateText,
} from "@/utils";
import { torusTestnet } from "$/constants/chains";
import { useReadContract } from "thirdweb/react";
import { formatEther } from "ethers";
import { log, logError } from "@/utils/sentryUtils";
import OptimizedImage from "../components/OptimizedImage";
import appConfig from "@/config";

interface INotificationProps {
  children: ReactNode;
}

const dartContract = getContractInstance(
  torusTestnet,
  appConfig.blockchain.contracts.dart
);

export default function Menu({ children }: INotificationProps) {
  const { userId, user, refetchUser } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [topup, setTopup] = useState(false);

  const { data: dartBalance, refetch } = useReadContract({
    contract: dartContract,
    method: "function balanceOf(address account) returns (uint256)",
    params: [user?.wallet?.address || ""],
  });

  const handleClose = () => {
    setOpen(false);
  };

  const handleTopup = () => {
    setTopup(true);
    handleClose();
  };

  const logoutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logError("Error logging out", error);
      } else {
        log("User logged out successfully");
        router.replace("/");
      }
    } catch (err) {
      logError("Unexpected error during logout", err);
    }
  };
  return (
    <>
      <button onClick={() => setOpen(true)}>{children}</button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed z-50  top-0 left-0 h-screen w-full"
          ></div>

          <div className="absolute w-full max-w-[240px] h-[270px] z-50 bottom-20 md:bottom-[5vh] right-4 md:left-44 border-primary-8 border-[1px] bg-[#191919] rounded-lg">
            <Link
              onClick={handleClose}
              href={userId ? `/home/profile/${userId}` : "/home"}
              className="flex items-center gap-2 text-primary-6 h-16 p-3 border-primary-8 border-b-[1px]"
            >
              <div>
                {/* <Image
                  className="rounded-full"
                  src={user?.avatar_url || "/profile.jpg"}
                  width={40}
                  height={40}
                  alt=""
                />
                 */}
                {user?.avatar_url ? (
                  <OptimizedImage
                    className="rounded-full drop-shadow-lg"
                    src={user?.avatar_url}
                    width={48}
                    height={48}
                    alt={`${user?.full_name || user?.username}'s profile`}
                    isProfile={true}
                    trackPerformance={true}
                    username={user?.full_name || user?.username || ""}
                    imageName={`profile-${user?.full_name || user?.username}`}
                    isAvatar={true}
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded-full" /> // Fallback avatar
                )}
              </div>
              <div className="flex flex-col">
                <p className="" title={user?.full_name ? user?.full_name : ""}>
                  {user?.full_name && formatDisplayName(user?.full_name)}
                </p>
                {user?.user_metadata.email && (
                  <p
                    className=""
                    title={
                      user?.user_metadata.email ? user?.user_metadata.email : ""
                    }
                  >
                    {truncateEmail(user?.user_metadata.email, 20)}
                  </p>
                )}
              </div>
            </Link>

            {/* <MenuItem
              onClick={handleClose}
              icon={<FlashIcon width={16} height={16} color="#C1C1C1" />}
              text={(() => {
                const userBalance = user?.creditBalance ?? 0;
                const dartConvertedBalance = dartBalance
                  ? Number(formatEther(dartBalance)) / 3 // divide by 3 cos 1 credit == 3 darts
                  : 0;
                const totalBalance = userBalance;
                return `${totalBalance.toFixed(2)} Credit${
                  totalBalance !== 1 ? "s" : ""
                }`;
              })()}
              action={
                <button onClick={handleTopup} className="underline">
                  Top Up
                </button>
              }
            /> */}

            <Link
              href={"https://www.linkedin.com/company/decenter-ai/"}
              target="_blank"
            >
              <MenuItem
                onClick={handleClose}
                icon={
                  <Image
                    src={"/icons/linkedin.png"}
                    width={16}
                    height={16}
                    alt="telegram"
                  />
                }
                text="LinkedIn"
                underlineOff={true}
              />
            </Link>

            <Link href={"https://t.me/decenteraicomchat"} target="_blank">
              <MenuItem
                onClick={handleClose}
                icon={
                  <Image
                    src={"/icons/telegram.png"}
                    width={16}
                    height={16}
                    alt="telegram"
                  />
                }
                text="Telegram"
                underlineOff={true}
              />
            </Link>

            <Link
              href={
                "https://twitter.com/decenteraicom?s=21&t=th7q1ztmiuaE2PoODm3k0A"
              }
              target="_blank"
            >
              <MenuItem
                onClick={handleClose}
                icon={
                  <Image src={"/icons/x.png"} width={16} height={16} alt="x" />
                }
                text="x  (formerly Twitter)"
              />
            </Link>

            {/* <MenuItem
              icon={<MoonIcon width={16} height={16} color="#C1C1C1" />}
              text="Dark Theme"
            /> */}

            <MenuItem
              onClick={logoutUser}
              icon={<LogoutIcon width={16} height={16} color="#C1C1C1" />}
              text="Logout"
              underlineOff={true}
            />
          </div>
        </>
      )}

      <Topup open={topup} setOpen={setTopup} refetch={refetchUser} />
    </>
  );
}

export function MenuItem({
  icon,
  text,
  underlineOff,
  action,
  onClick,
}: {
  icon: ReactNode;
  text: string;
  onClick?: () => void;
  underlineOff?: boolean;
  action?: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex justify-between py-2 px-4 border-primary-8 text-primary-6 h-10 cursor-pointer ${
        !underlineOff ? "border-b-[1px]" : ""
      }`}
    >
      <div className="flex gap-2 items-center justify-center ">
        <div>{icon}</div>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}
