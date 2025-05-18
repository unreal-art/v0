"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "$/supabase/client";
import Image from "next/image";

const protectedRoutes = ["/home"];

export default function PathnameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        // Get session data first (this is more reliable for checking auth status)
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        // Check if we're on a protected route
        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route),
        );

        // Log state for debugging
        console.log("Auth check:", {
          pathname,
          isProtectedRoute,
          session: session ? "exists" : "null",
        });

        // Only redirect if no session AND we're on a protected route
        if (!session && isProtectedRoute) {
          console.log("Redirecting to /auth due to failed authentication");
          router.replace("/auth");
        }

        setAuthChecked(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        // On error, redirect to auth page if on protected route
        // if (protectedRoutes.some(route => pathname.startsWith(route))) {
        //   router.replace("/auth");
        // }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loader while checking authentication
  if (loading && !authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
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

  return <>{children}</>;
}
