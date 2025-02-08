"use client"
import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import NavLink from "./components/navLink";
import CreateBtn from "./components/createBtn";
import dynamic from "next/dynamic";


const GenerationProgress = dynamic(
  () => import("./components/generationProgress"),
  { ssr: false }
)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className={`fixed flex flex-col-reverse md:flex-row bg-color-primary-1 text-primary-11 h-screen w-screen`}>

        <div className="md:flex md:flex-col p-3 gap-3 items-center basis-1/12 bg-primary-13 h-full">

          <Link href={"/"} className="hidden md:block m-6">
            <Image src={"/icons/logo.png"} alt="logo" width={38} height={38} />
          </Link>

          <div className="flex md:flex-col flex-grow justify-between gap-3">

            <div className="flex flex-grow justify-evenly md:flex-col md:justify-start">
              <NavLink href={"/home"} text="Home" icon="dashboard"  />
              <NavLink href={"/home/creations"} text="Creations" icon="creations"  />
            </div>

            <div className="md:hidden">
              <CreateBtn />
            </div>

            <div className="flex flex-grow justify-evenly md:flex-col md:justify-end">
              <NavLink href={"/home/notification"} text="Notification" icon="notification"  />
              <div className="hidden md:block">
                <NavLink href={"/home/profile"} text="Profile" icon="profile"  />
              </div>
              <NavLink href="/menu" text="Menu" icon="menu" />
            </div>

          </div>

        </div>

        <div className="flex justify-center basis-11/12 bg-[#080808] text-primary-8 h-full overflow-y-auto">
          {children}
        </div>

      </main>

      <GenerationProgress />

    </>
  );
}
