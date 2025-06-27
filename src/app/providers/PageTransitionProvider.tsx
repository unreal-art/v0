"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationAndProfileStore } from "@/stores/creationAndProfileStore";

export const PageTransitionContext = React.createContext({
  isPageTransitioning: false,
});

// Create memoized versions of transition components to prevent unnecessary re-renders
const PageTransition = React.memo(
  ({ children, stableKey, currentVariants }: any) => (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={stableKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={currentVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
);

PageTransition.displayName = "PageTransition";

export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lastNavigationType, setNavigationType, setIsTransitioning } =
    useCreationAndProfileStore();

  const isAnimatingRef = useRef(false);

  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef(pathname);
  const prevSearchParamsRef = useRef(
    searchParams?.get("s") || searchParams?.get("tab") || ""
  );

  // Create a stable key that only changes for page transitions, not tab changes
  const [stableKey, setStableKey] = useState(pathname);

  // Check if navigation is a tab change (within the same page)
  // This function is memoized to avoid unnecessary recreations
  const isTabChange = useCallback(
    (
      currentPath: string,
      prevPath: string | null,
      currentTab: string,
      prevTab: string
    ) => {
      // If paths are different, it's a page change, not a tab change
      if (currentPath !== prevPath) return false;

      // If tabs are different but paths are the same, it's a tab change
      return currentTab !== prevTab;
    },
    []
  );

  // Monitor URL changes to handle transitions
  useEffect(() => {
    const currentSearchKey =
      searchParams?.get("s") || searchParams?.get("tab") || "";

    // Skip initial render
    if (!prevPathRef.current) {
      prevPathRef.current = pathname;
      prevSearchParamsRef.current = currentSearchKey;
      setStableKey(pathname);
      return;
    }

    // Determine if this is a tab change or page change
    const tabChange = isTabChange(
      pathname,
      prevPathRef.current,
      currentSearchKey,
      prevSearchParamsRef.current || ""
    );

    // Only trigger animations when needed
    if (!tabChange && pathname !== prevPathRef.current) {
      // Real page change
      setNavigationType("page");
      setIsPageTransitioning(true);

      // Update the stable key to force a new animation
      setStableKey(pathname);

      // Reset transition state after animation completes using requestAnimationFrame
      // for better performance and smoother animations
      const animationDuration = 300; // Match this to your animation duration
      const startTime = performance.now();

      const resetTransition = (timestamp: number) => {
        const elapsed = timestamp - startTime;

        if (elapsed >= animationDuration) {
          setIsPageTransitioning(false);
        } else {
          requestAnimationFrame(resetTransition);
        }
      };

      requestAnimationFrame(resetTransition);
    } else if (tabChange) {
      // Tab change - lighter transition
      setNavigationType("tab");
      setIsTransitioning(true);

      // Reset the transition after a short delay using requestAnimationFrame
      // for better performance and smoother animations
      const tabAnimationDuration = 150; // Shorter duration for tab changes
      const tabStartTime = performance.now();

      const resetTabTransition = (timestamp: number) => {
        const elapsed = timestamp - tabStartTime;

        if (elapsed >= tabAnimationDuration) {
          setIsTransitioning(false);
        } else {
          requestAnimationFrame(resetTabTransition);
        }
      };

      requestAnimationFrame(resetTabTransition);
    }

    // Update previous values for next comparison
    prevPathRef.current = pathname;
    prevSearchParamsRef.current = currentSearchKey;
  }, [
    pathname,
    searchParams,
    isTabChange,
    setNavigationType,
    setIsTransitioning,
  ]);

  // Preload related content
  useEffect(() => {
    // Only preload if we're in a section with tabs
    if (
      pathname.includes("/home") ||
      pathname.includes("/creations") ||
      pathname.includes("/profile")
    ) {
      // Use requestAnimationFrame to avoid blocking the main thread
      requestAnimationFrame(() => {
        // Preload common tab variations
        const preloadLinks = document.head.querySelectorAll(
          'link[rel="preload"][as="fetch"]'
        );
        const existingPreloads = Array.from(preloadLinks).map(
          (link) => (link as HTMLLinkElement).href
        );

        // Potential paths to preload
        const pathsToPreload: string[] = [];

        if (pathname.includes("/home")) {
          // Update with the actual Home tab param names
          const tabs = [
            "explore",
            "following",
            "feed",
            "featured_mints",
            "search",
          ];
          tabs.forEach((tab) => {
            const url = `${pathname}?s=${tab}`;
            if (!existingPreloads.includes(url)) pathsToPreload.push(url);
          });
        } else if (
          pathname.includes("/creations") ||
          pathname.includes("/profile")
        ) {
          const sections = ["public", "private", "liked", "pinned", "draft"];
          sections.forEach((section) => {
            const url = `${pathname}?s=${section}`;
            if (!existingPreloads.includes(url)) pathsToPreload.push(url);
          });
        }

        // Add preload tags for the identified paths
        pathsToPreload.forEach((path) => {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "fetch";
          link.href = path;
          document.head.appendChild(link);
        });
      });
    }
  }, [pathname]);

  // Animation variants for different types of transitions
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const noAnimationVariants = {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
  };

  // Use appropriate animation based on transition type
  const currentVariants =
    lastNavigationType === "tab" ? noAnimationVariants : pageVariants;

  return (
    <PageTransitionContext.Provider value={{ isPageTransitioning }}>
      <PageTransition stableKey={stableKey} currentVariants={currentVariants}>
        {children}
      </PageTransition>
    </PageTransitionContext.Provider>
  );
}
