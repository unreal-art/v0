"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function OfflineAlert() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);
    setShowOffline(!navigator.onLine);

    // Handle online status changes
    const handleOnline = () => {
      setIsOnline(true);
      // Hide the offline message after a delay
      setTimeout(() => setShowOffline(false), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Function to dismiss the alert
  const dismissAlert = () => {
    setShowOffline(false);
  };

  // Function to handle retry (reload the page)
  const handleRetry = () => {
    window.location.reload();
  };

  // Don't render anything if we should hide the alert
  if (!showOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-primary-13 text-primary-6 transition-all duration-300 transform">
      <div className="max-w-md mx-auto rounded-lg bg-primary-13 border border-primary-12 shadow-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-24">
            <img
              src="/Icon-White.png"
              alt="Logo"
              className="opacity-80 w-24 h-24"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-1">
              {isOnline ? "Back Online" : "You're Offline"}
            </h3>
            <p className="text-sm opacity-80">
              {isOnline
                ? "Connection restored. You now have full access."
                : "Some features may be limited. We'll automatically reconnect when you're back online."}
            </p>
            {!isOnline && (
              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleRetry}
                  className="text-sm px-3 py-1 rounded bg-primary-12 hover:bg-primary-11 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={dismissAlert}
                  className="text-sm px-3 py-1 rounded bg-primary-10 hover:bg-primary-9 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
