"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { createClient } from "$/supabase/client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

// Use a loading component to show while checking auth
const LoadingScreen = () => (
  <div className="h-[100dvh] w-screen flex items-center justify-center bg-primary-13">
    <Image src="/Icon-White.png" alt="unreal" height={50} width={50} priority />
  </div>
);

export default function ClientHome() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check current online status
    setIsOffline(!navigator.onLine);

    // Set up online/offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // If user is offline, show offline page instead of auth page
      if (isOffline) {
        // Get current path without leading slash
        const from = pathname?.replace(/^\/+|\/+$/g, "") || "";

        // Add from parameter if we have a path and it's not already offline.html
        if (from && !from.includes("offline")) {
          router.replace(`/offline.html?from=${from}`);
        } else {
          router.replace("/offline.html");
        }
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Only navigate if component is still mounted
        if (mounted) {
          if (user) {
            router.replace("/home");
          } else {
            router.replace("/auth");
          }
        }
      } catch (error) {
        if (mounted) {
          // If offline or network error, show offline page
          if (!navigator.onLine || error instanceof TypeError) {
            // Get current path without leading slash
            const from = pathname?.replace(/^\/+|\/+$/g, "") || "";

            // Add from parameter if we have a path and it's not already offline.html
            if (from && !from.includes("offline")) {
              router.replace(`/offline.html?from=${from}`);
            } else {
              router.replace("/offline.html");
            }
          } else {
            router.replace("/auth");
          }
        }
      }
    };

    // Set up auth state change listener
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (mounted) {
          if (isOffline) {
            // Get current path without leading slash
            const from = pathname?.replace(/^\/+|\/+$/g, "") || "";

            // Add from parameter if we have a path and it's not already offline.html
            if (from && !from.includes("offline")) {
              router.replace(`/offline.html?from=${from}`);
            } else {
              router.replace("/offline.html");
            }
          } else if (session) {
            router.replace("/home");
          } else {
            router.replace("/auth");
          }
        }
      },
    );

    checkAuth();

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, isOffline, pathname]);

  return <LoadingScreen />;
}
