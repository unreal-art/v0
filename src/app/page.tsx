"use client";
import Image from "next/image";
import SocialLink from "./social-link";
import HomeCarousel from "./homeCarousel";
import LandingSlider from "./landing-slider";

export default function Home() {
  return (
    <main className="flex flex-col items-center bg-[#050505] h-screen">

      <div className="flex justify-center w-full">
        <Image src={"/logo.png"} alt="logo" width={140} height={36} />
      </div>

      {/* <LandingSlider /> */}

      <div className="borderColor-primary-10/50 border-[1px] w-[350px] rounded-xl">


      </div>

      <div className="flex gap-9 justify-center py-3 px-6 borderColor-primary-10/50 border-[1px] rounded-[20px]">
        <SocialLink icon="/icons/discord.png" url="" />
        <SocialLink icon="/icons/linkedin.png" url="" />
        <SocialLink icon="/icons/telegram.png" url="" />
        <SocialLink icon="/icons/x.png" url="" />
      </div>

    </main>
  );
}
