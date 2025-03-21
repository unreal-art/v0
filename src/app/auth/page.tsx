import SocialLink from "../components/social-link";
import LandingCarousel from "../components/landingCarousel";
import { createClient } from "$/supabase/server";
import { redirect } from "next/navigation";
import LandingCarouselTwo from "../components/landingCarouselTwo";
import { AppleIcon, GoogleIcon } from "../components/icons";
import AuthBtn from "../components/authBtn";

export default async function Auth() {
  const supabaseSSR = await createClient();
  const {
    data: { user },
  } = await supabaseSSR.auth.getUser(); // ✅ Get user session

  if (user) {
    redirect("/home"); // ✅ Redirect if authenticated
  }

  return (
    <main className="bg-[#050505] h-screen overflow-hidden">
      <div className=" w-full overflow-clip  h-[60%]  z-50">
        <LandingCarouselTwo />
      </div>

      <div
        style={{ zIndex: 1000 }}
        className=" h-[30%]  bottom-28 sm:bottom-32 md:bottom-28  inset-x-0 mx-auto flex flex-col justify-center items-center z-10

                   w-[350px] max-w-[90%] sm:max-w-[80%]
                   rounded-b-xl gap-4   shadow-lg"
      >
        <AuthBtn
          icon={<GoogleIcon color="#C1C1C1" width={21} height={20} />}
          provider="google"
        >
          Continue with Google
        </AuthBtn>

        <AuthBtn
          icon={<AppleIcon color="#C1C1C1" width={21} height={20} />}
          provider="apple"
        >
          Continue with Apple
        </AuthBtn>
      </div>
      <div className="flex h-[10%]  items-center justify-center w-full absolute bottom-10  border-primary-8 border-t   ">
        <div className="flex gap-9 justify-center py-3 px-6 borderColor-primary-10/50 border-[1px] rounded-[20px] h-12">
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
