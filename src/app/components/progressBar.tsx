"use client";

import { useEffect, memo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress for smoother experience
NProgress.configure({
  showSpinner: false,
  speed: 300,
  minimum: 0.15,
  trickleSpeed: 120,
  easing: "ease-out",
  parent: "body",
});

const ProgressBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef(pathname);
  const prevSearchRef = useRef(searchParams?.toString());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get current values
    const currentPath = pathname;
    const currentSearch = searchParams?.toString();

    // Skip if only tab parameter changed
    const isOnlyTabChange =
      (prevPathRef.current === currentPath &&
        prevSearchRef.current?.includes("tab=") &&
        currentSearch?.includes("tab=")) ||
      (prevSearchRef.current?.includes("s=") && currentSearch?.includes("s="));

    // Only show progress for actual page changes, not tab switches
    if (!isOnlyTabChange) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Use requestAnimationFrame for smoother animation start
      requestAnimationFrame(() => {
        NProgress.start();

        // Quickly move to 30% to give perception of speed
        requestAnimationFrame(() => {
          NProgress.set(0.3);
        });
      });

      // Set a delay to complete the progress
      timeoutRef.current = setTimeout(() => {
        NProgress.done(true); // Force complete
      }, 300); // Slightly longer than transition time in PageTransitionProvider
    }

    // Update refs for next comparison
    prevPathRef.current = currentPath;
    prevSearchRef.current = currentSearch;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, searchParams]); // Only depend on route changes

  return (
    <>
      <style jsx global>{`
        #nprogress {
          pointer-events: none;
        }

        #nprogress .bar {
          background: #fff;
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          opacity: 0.8;
        }

        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5),
            0 0 5px rgba(255, 255, 255, 0.5);
          opacity: 0.8;
          transform: rotate(3deg) translate(0px, -4px);
        }
      `}</style>
    </>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(ProgressBar);
