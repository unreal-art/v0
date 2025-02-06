"use client";
import Image from "next/image";
import SocialLink from "./components/social-link";
import AuthBtn from "./components/authBtn";


export default function Home() {
  return (
    <main className="flex flex-col items-center bg-[#050505] h-screen py-16">

      <div className="flex justify-center w-full mb-10">
        <Image src={"/logo.png"} alt="logo" width={140} height={36} />
      </div>

      <div className="relative flex flex-col justify-center items-center">

        {/* <LandingSlider /> */}

        <div className="flex h-[40vh] z-10 gap-5">
          <Image src={"/images/landing-1.png"} height={405} width={405} alt="view" />
          <Image src={"/images/landing-2.jpeg"} height={405} width={405} alt="view" />
          <Image src={"/images/landing-3.png"} height={405} width={405} alt="view" />
        </div>

        <div className="absolute top-[360px] flex flex-col justify-center items-center border-primary-10/50 border-[1px] w-[350px] rounded-xl gap-4 py-12">

          <AuthBtn
            icon={
              <div>

              </div>
            }> 
            Continue with Google
          </AuthBtn>

          <AuthBtn
            icon={
              <div>

              </div>
            }> 
            Continue with Apple
          </AuthBtn>


          <AuthBtn
            icon={
              <div>

              </div>
            }> 
            Continue with Wallet
          </AuthBtn>


        </div>

      </div>

      <div className="flex-grow"></div>

      <div className="flex gap-9 justify-center py-3 px-6 borderColor-primary-10/50 border-[1px] rounded-[20px]">
        <SocialLink icon="/icons/discord.png" url="" />
        <SocialLink icon="/icons/linkedin.png" url="" />
        <SocialLink icon="/icons/telegram.png" url="" />
        <SocialLink icon="/icons/x.png" url="" />
      </div>

    </main>
  );
}
