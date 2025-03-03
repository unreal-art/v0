import SocialLink from "./components/social-link";
import LandingCarousel from "./components/landingCarousel";

export default function Home() {
  return (
    <main className="bg-[#050505] h-screen overflow-clip">
      <div className="absolute w-full overflow-clip top-[16vh] md:top-[6vh] h-[50vh] md:h-[80vh] z-10">
        <LandingCarousel />
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
