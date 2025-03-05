import SocialLink from "./components/social-link";
import LandingCarousel from "./components/landingCarousel";
import { createClient } from "$/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabaseSSR = await createClient();
  const {
    data: { user },
  } = await supabaseSSR.auth.getUser(); // ✅ Get user session

  if (user) {
    redirect("/home"); // ✅ Redirect if authenticated
  }

  return (
    <main className="bg-[#050505] h-screen overflow-clip">
      <div className="absolute w-full overflow-clip top-[16vh] md:top-[6vh] h-[50vh] md:h-[80vh] z-10">
        <LandingCarousel />
      </div>

      <div className="flex justify-center w-full absolute bottom-10">
        <div className="flex gap-9 justify-center py-3 px-6 borderColor-primary-10/50 border-[1px] rounded-[20px]">
          {/* <SocialLink icon="/icons/discord.png" url="" /> */}
          <SocialLink
            icon="/icons/linkedin.png"
            url="https://www.linkedin.com/company/decenter-ai/"
          />
          <SocialLink
            icon="/icons/telegram.png"
            url="https://t.me/decenteraicomchat"
          />
          <SocialLink
            icon="/icons/x.png"
            url="https://twitter.com/decenteraicom?s=21&t=th7q1ztmiuaE2PoODm3k0A"
          />
        </div>
      </div>
    </main>
  );
}
