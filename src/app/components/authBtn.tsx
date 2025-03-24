"use client";
import { ReactNode, useState, useEffect } from "react";
import { createClient } from "$/supabase/client";
import config from "$/config";
import { Provider } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AuthBtnProps {
  icon: ReactNode;
  children: string;
  provider: Provider;
}

export default function AuthBtn({ icon, children, provider }: AuthBtnProps) {
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine);

    // Set up listeners for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSignIn = () => {
    // If offline, redirect to offline page instead of attempting auth
    if (!isOnline) {
      router.replace("/offline.html");
      return;
    }

    const redirectTo = `${config.domainName}/api/auth/callback`;
    setLoading(true);

    try {
      const supabase = createClient();
      supabase.auth.signInWithOAuth({
        provider: provider ? provider : ("" as Provider),
        options: {
          redirectTo: `${redirectTo}`,
        },
      });
    } catch (error) {
      if (!navigator.onLine) {
        router.replace("/offline.html");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="border-primary-9 text-primary-6 rounded-full flex justify-center items-center h-10 w-[276px] border-[1px]"
      disabled={loading}
    >
      {icon}
      <p className="block w-40">{children}</p>
    </button>
  );
}
