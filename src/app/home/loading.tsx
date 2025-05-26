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
            onError={(e) => {
              console.error("Loading image failed:", e);
              // Hide the image if it fails to load
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        {/* Always show loading text as backup */}
        <div className="text-white text-lg">Loading...</div>
      </div>
    </div>
  );
}
