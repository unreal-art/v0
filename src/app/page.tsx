"use client";
import Image from "next/image";
import SocialLink from "./components/social-link";
import AuthBtn from "./components/authBtn";
import LandingCarousel from "./components/landingCarousel";

export default function Home() {
  return (
    <main className="bg-[#050505] h-screen overflow-clip">

      <div className="absolute z-10 top-[12vh] md:top-[6vh] flex justify-center w-full mb-10">
        <Image src={"/logo.png"} alt="logo" width={140} height={36} />
      </div>

      <div className="absolute w-full overflow-clip top-[16vh] md:top-[6vh] h-[50vh] md:h-[80vh] z-10">
        <LandingCarousel />
      </div>

      <div className="absolute top-[56vh] md:top-[70vh] flex justify-center w-full ">

        <div className="flex z-20 flex-col justify-center items-center border-primary-10 border-x-[1px] border-b-[1px] w-[350px] rounded-xl gap-4 py-12">
          <AuthBtn icon={<div></div>} provider="google">
            Continue with Google
          </AuthBtn>

          <AuthBtn icon={<div></div>} provider="apple">
            Continue with Apple
          </AuthBtn>
        </div> 

      </div>

      <div className="flex justify-center w-full absolute bottom-10"> 
        <div className="flex gap-9 justify-center py-3 px-6 borderColor-primary-10/50 border-[1px] rounded-[20px]">
          <SocialLink icon="/icons/discord.png" url="" />
          <SocialLink icon="/icons/linkedin.png" url="" />
          <SocialLink icon="/icons/telegram.png" url="" />
          <SocialLink icon="/icons/x.png" url="" />
        </div>
      </div>

    </main>
  );
}
