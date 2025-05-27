"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "$/supabase/client";
import Image from "next/image";

export default function PathnameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Optional: Initialize any client-side auth state synchronization
    const initializeAuth = async () => {
      try {
        // This just ensures the client-side auth state is in sync
        // but doesn't handle redirects (that's done in middleware)
        await supabase.auth.getSession();
      } catch (error) {
        console.error("Client-side auth initialization failed:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (optional)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "Auth state changed:",
        event,
        session ? "session exists" : "no session"
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading screen only briefly during initialization
  // The middleware will handle redirects, so this is just for UX
  if (isInitializing) {
    return (
      <div
        style={{
          height: "100dvh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
        }}
      >
        <div className="flex flex-col items-center gap-4">
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

  return <>{children}</>;
}
