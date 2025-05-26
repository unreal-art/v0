import Image from "next/image";

export default function Loading() {
  return (
    <div className="h-[100dvh] w-screen top-0 left-0 fixed z-50 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        {/* Fallback in case image fails */}
        <div className="relative">
          <Image
            src="/Icon-White.png"
            alt="unreal"
            height={50}
            width={50}
            priority
           
          />
        </div>
       
      </div>
    </div>
  );
}
