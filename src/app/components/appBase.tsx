"use client";
import Image from "next/image";
import Link from "next/link";
import NavLink from "../home/components/navLink";
import CreateBtn from "../home/components/createBtn";
import Notifications from "../notifications";
import Menu from "../menu";
import { useUser } from "@/hooks/useUser";
import { Toaster } from "sonner";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";

export default function AppBase({ children }: { children: React.ReactNode }) {
  const { userId } = useUser();

  return (
    <main
      className={`fixed z-10 flex flex-col-reverse md:flex-row bg-color-primary-1 text-primary-11 h-[100dvh] w-screen`}
    >
      <Toaster />
      <div className="md:flex md:flex-col p-3 gap-3 items-center basis-1/12 bg-primary-13 h-full">
        <Link href={"/"} className="hidden md:block m-6">
          <Image src={"/icons/logo.png"} alt="logo" width={38} height={38} />
        </Link>

        <div className="flex md:flex-col flex-grow justify-between gap-3">
          <div className="flex flex-grow justify-evenly md:flex-col md:justify-start">
            <NavLink href={"/home"} text="Home" icon="dashboard" />
            <NavLink
              href={"/home/creations"}
              text="Creations"
              icon="creations"
            />
          </div>

          <div className="md:hidden">
            <CreateBtn />
          </div>

          <div className="flex flex-grow justify-evenly md:flex-col md:justify-end">
            <Notifications>
              <NavLink href={"#"} text="Notification" icon="notification" />
            </Notifications>
            <div className="hidden md:block">
              <NavLink
                href={"/home/profile/" + userId}
                text="Profile"
                icon="profile"
              />
            </div>
            <Menu>
              <NavLink href="#" text="Menu" icon="menu" />
            </Menu>
          </div>
        </div>
      </div>

      <div className="flex   justify-center basis-11/12 bg-[#080808] text-primary-8 h-full overflow-y-auto">
        {children}
      </div>
    </main>
  );
}
