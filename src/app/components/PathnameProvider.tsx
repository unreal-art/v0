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
      try {
        // Get both user and session data
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route)
        );

        // Log for debugging purposes
        console.log("Auth check:", {
          user: user ? "exists" : "null",
          session: session ? "exists" : "null",
          isProtectedRoute,
          userError: userError?.message,
          sessionError: sessionError?.message,
        });

        // Only redirect if both checks fail AND we're on a protected route
        if (!user && !session && isProtectedRoute) {
          console.log("Redirecting to /auth due to failed authentication");
          router.replace("/auth");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // If there's an unexpected error and we're on a protected route, redirect
        if (protectedRoutes.some((route) => pathname.startsWith(route))) {
          router.replace("/auth");
        } else {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const { error } = await supabase.auth.getUser();

  //     if (
  //       error &&
  //       protectedRoutes.some((route) => pathname.startsWith(route))
  //     ) {
  //       router.replace("/auth"); // Redirect if not authenticated
  //     } else {
  //       setLoading(false); // Auth check is done, allow rendering
  //     }
  //   };

  //   checkAuth();
  // }, [pathname, router, supabase]);

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
