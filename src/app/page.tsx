import { redirect } from "next/navigation";
import { createClient } from "$/supabase/server";
import Image from "next/image";

// Force static generation for faster loading
export const dynamic = "force-static";
export const revalidate = 0;

// Use a loading component to show while checking auth
const LoadingScreen = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-primary-13">
    <Image src="/Icon-White.png" alt="unreal" height={50} width={50} priority />
  </div>
);

export default async function Home() {
  // Check if user is authenticated and redirect accordingly
  try {
    const supabaseSSR = await createClient();
    const {
      data: { user },
    } = await supabaseSSR.auth.getUser();

    // Use immediate redirects
    if (user) {
      redirect("/home");
    } else {
      redirect("/auth");
    }
  } catch (error) {
    redirect("/auth");
  }

  // This will never be rendered but provides a fallback
  return <LoadingScreen />;
}
