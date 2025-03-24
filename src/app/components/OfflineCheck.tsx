"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function OfflineCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Only run once
    if (isChecked) return;

    setIsChecked(true);

    // Check if user is offline
    if (!navigator.onLine) {
      // Get current path without leading slash
      const from = pathname?.replace(/^\/+|\/+$/g, "") || "";

      // Add from parameter if we have a path and it's not already offline.html
      if (from && !from.includes("offline")) {
        router.replace(`/offline.html?from=${from}`);
      } else {
        router.replace("/offline.html");
      }
    }

    // Set up listeners for future status changes
    const handleOffline = () => {
      // Get current path without leading slash
      const from = pathname?.replace(/^\/+|\/+$/g, "") || "";

      // Add from parameter if we have a path and it's not already offline.html
      if (from && !from.includes("offline")) {
        router.replace(`/offline.html?from=${from}`);
      } else {
        router.replace("/offline.html");
      }
    };

    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("offline", handleOffline);
    };
  }, [router, isChecked, pathname]);

  // This component doesn't render anything visible
  return null;
}
