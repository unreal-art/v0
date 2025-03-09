"use client";

import { usePathname, useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "$/supabase/client";

const protectedRoutes = ["/home"];

export default function PathnameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (
        error &&
        protectedRoutes.some((route) => pathname.startsWith(route))
      ) {
        router.replace("/auth"); // Redirect if not authenticated
      } else {
        setLoading(false); // Auth check is done, allow rendering
      }
    };

    checkAuth();
  }, [pathname, router, supabase]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-primary-13">
        <Image
          src="/Icon-White.png"
          alt="unreal"
          height={50}
          width={50}
          priority
        />
      </div>
    ); // Show loader until auth is checked
  }

  return <>{children}</>;
}
