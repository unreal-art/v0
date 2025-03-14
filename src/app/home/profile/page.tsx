import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "$/supabase/server";
export default async function Home() {
  //check load condition and redirect to proper page
  const supabaseSSR = await createClient();
  const {
    data: { user },
  } = await supabaseSSR.auth.getUser(); // ✅ Get user session

  if (user) {
    redirect("/home/profile/" + user.id); // ✅ Redirect if authenticated
  } else {
    redirect("/auth");
  }

  // return (
  //   <div className="h-screen w-screen  flex items-center justify-center bg-primary-13">
  //     <Image
  //       src="/Icon-White.png"
  //       alt="unreal"
  //       height={50}
  //       width={50}
  //       priority
  //     />
  //   </div>
  // );
}
