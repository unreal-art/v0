import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root path to auth page
  redirect("/auth");

  
  return (
    <div className="h-screen w-screen  flex items-center justify-center bg-primary-13">
      <Image
        src="/Icon-White.png"
        alt="unreal"
        height={50}
        width={50}
        priority
      />
    </div>
  );
}
