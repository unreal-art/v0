"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "$/supabase/client"; // Keeping your original alias
import Image from "next/image";

const protectedRoutes = ["/home"];
const AUTH_TIMEOUT_MS = 10000; // 10 seconds timeout for auth requests

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
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Authentication check timed out")),
          AUTH_TIMEOUT_MS,
        );
      });

      try {
        setLoading(true);

        // Race the auth check against the timeout
        const authPromise = supabase.auth.getSession();
        const result = await Promise.race([authPromise, timeoutPromise]);

        // If we get here, authPromise resolved before the timeout
        const { data: sessionData } = result as Awaited<typeof authPromise>;
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
      } catch (error) {
        console.error("Authentication check failed:", error);

        // We'll treat timeout or network errors as auth failures for protected routes
        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route),
        );
        if (isProtectedRoute) {
          console.log("Network issue detected, redirecting to auth page");
          router.replace("/auth");
        }
      } finally {
        // Update both states at the end to avoid race conditions
        setAuthChecked(true);
        setLoading(false);
      }
    };

    checkAuth();

    // Cleanup function to handle component unmounting during auth check
    return () => {
      // This will help avoid state updates on unmounted components
    };
  }, [pathname, router]);

  // Only show loader while we're loading and haven't completed the auth check
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
