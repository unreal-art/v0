"use client";
import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import NavLink from "./components/navLink";
import CreateBtn from "./components/createBtn";
import dynamic from "next/dynamic";
import QueryProvider from "../providers/QueryClientProvider";
import PathnameProvider from "../components/PathnameProvider";
import { ThirdwebProvider } from "thirdweb/react";
import Notifications from "../notifications";
import { useUser } from "@/hooks/useUser";
import { GenerationStoreProvider } from "../providers/GenerationStoreProvider";
import Menu from "../menu";

const GenerationProgress = dynamic(
  () => import("./components/generationProgress"),
  { ssr: false },
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = useUser();
  return (
    <QueryProvider>
      <PathnameProvider>
        <ThirdwebProvider>
          <GenerationStoreProvider>
            <>
              <main
                className={`fixed flex flex-col-reverse md:flex-row bg-color-primary-1 text-primary-11 h-[100dvh] w-screen`}
              >
                <div className="md:flex md:flex-col p-3 gap-3 items-center basis-1/12 bg-primary-13 h-full">
                  <Link href={"/"} className="hidden md:block m-6">
                    <Image
                      src={"/icons/logo.png"}
                      alt="logo"
                      width={38}
                      height={38}
                    />
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
                        <NavLink
                          href={"#"}
                          text="Notification"
                          icon="notification"
                        />
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

                <div className="flex justify-center basis-11/12 bg-[#080808] text-primary-8 h-full overflow-y-auto">
                  {children}
                </div>
              </main>

              <GenerationProgress />
            </>
          </GenerationStoreProvider>
        </ThirdwebProvider>
      </PathnameProvider>
    </QueryProvider>
  );
}
