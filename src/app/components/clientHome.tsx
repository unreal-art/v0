"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "$/supabase/client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

// Use a loading component to show while checking auth
const LoadingScreen = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-primary-13">
    <Image src="/Icon-White.png" alt="unreal" height={50} width={50} priority />
  </div>
);

export default function ClientHome() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
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
          router.replace("/auth");
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
          if (session) {
            router.replace("/home");
          } else {
            router.replace("/auth");
          }
        }
      }
    );

    checkAuth();

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return <LoadingScreen />;
}
