"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "$/supabase/client";
import { useEffect } from "react";

const protectedRoutes = ["/home"];

export default function PathnameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { error } = await supabase.auth.getUser();

      if (
        error &&
        protectedRoutes.some((route) => pathname.startsWith(route))
      ) {
        router.replace("/"); // Redirect to "/" if not authenticated
      }
    };

    checkAuth();
  }, [pathname, router, supabase]);

  return <>{children}</>;
}
