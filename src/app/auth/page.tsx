import SocialLink from "../components/social-link";
import { createClient } from "$/supabase/server";
import { redirect } from "next/navigation";
import LandingCarouselTwo from "../components/landingCarouselTwo";
import { GoogleIcon } from "../components/icons";
import AuthBtn from "../components/authBtn";
// import OfflineCheck from "../components/OfflineCheck";

export default async function Auth() {
  try {
    const supabaseSSR = await createClient();
    const {
      data: { user },
    } = await supabaseSSR.auth.getUser(); // Get user session

    if (user) {
      redirect("/home"); // Redirect if authenticated
    }

    return (
      <main className="bg-primary-13 h-[100dvh] flex flex-col ">
        <div className="w-full h-[65%]  overflow-clip">
          <LandingCarouselTwo />
        </div>

        <div
          style={{ zIndex: 1000 }}
          className="h-[20%]  inset-x-0 mx-auto flex flex-col justify-center items-center w-[350px] max-w-[90%] sm:max-w-[80%] rounded-b-xl gap-4 shadow-lg"
        >
          <AuthBtn
            icon={<GoogleIcon color="#C1C1C1" width={21} height={20} />}
            provider="google"
          >
            Continue with Google
          </AuthBtn>
        </div>

        <div className="flex-1 flex flex-col items-center  justify-center w-full borderColor-primary-10/50 ">
          <div className="flex gap-9 justify-center py-3 px-6 max-h-14 borderColor-primary-10/50 border-[1px] rounded-[20px]">
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
  } catch (error) {
    console.error("Unexpected error in auth page:", error);
    return (
      <main className="bg-primary-13 h-[100dvh] flex flex-col ">
        <div className="w-full h-[65%]  overflow-clip">
          <LandingCarouselTwo />
        </div>

        <div
          style={{ zIndex: 1000 }}
          className="h-[20%]  inset-x-0 mx-auto flex flex-col justify-center items-center w-[350px] max-w-[90%] sm:max-w-[80%] rounded-b-xl gap-4 shadow-lg"
        >
          <AuthBtn
            icon={<GoogleIcon color="#C1C1C1" width={21} height={20} />}
            provider="google"
          >
            Continue with Google
          </AuthBtn>
        </div>

        <div className="flex-1 flex flex-col items-center  justify-center w-full borderColor-primary-10/50 ">
          <div className="flex gap-9 justify-center py-3 px-6 max-h-14 borderColor-primary-10/50 border-[1px] rounded-[20px]">
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
}
