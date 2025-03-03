import Image from "next/image";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="h-screen w-screen top-0 left-0 fixed z-50 flex items-center justify-center bg-primary-13">
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
