"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationAndProfileStore } from "@/stores/creationAndProfileStore";

export const PageTransitionContext = React.createContext({
  isPageTransitioning: false,
});

// Animation variants for smoother transitions - ONLY used for actual page changes
const pageVariants = {
  initial: {
    opacity: 0.98,
    scale: 0.997,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: [0.2, 0.0, 0.2, 1], // Improved easing function based on Material Design
    },
  },
  exit: {
    opacity: 0.98,
    scale: 0.997,
    transition: {
      duration: 0.1,
      ease: [0.2, 0.0, 0.2, 1],
    },
  },
};

// No animation for tab changes - instant transition
const noAnimationVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
};

export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    lastNavigationType,
    isTransitioning,
    setNavigationType,
    setIsTransitioning,
  } = useCreationAndProfileStore();

  // Animation frame ID for cleanup
  const animationRef = useRef<number | null>(null);

  // Track if animation is in progress to prevent flickering
  const isAnimatingRef = useRef(false);

  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevSearchKey, setPrevSearchKey] = useState(
    searchParams?.get("tab") || searchParams?.get("s") || ""
  );

  // Create a stable key that only changes for page transitions, not tab changes
  // This is the key insight: by keeping the key the same during tab changes,
  // we prevent AnimatePresence from triggering animations
  const [stableKey, setStableKey] = useState(pathname);

  // Helper function to check if navigation is just a tab change
  const isTabChange = useCallback(
    (
      newPath: string,
      oldPath: string,
      newSearchKey?: string,
      oldSearchKey?: string
    ) => {
      // If the pathname has changed completely, it's a page change, not a tab change
      if (newPath !== oldPath) return false;

      // If search parameter changed but it's just a tab or section parameter, consider it a tab change
      if (
        newSearchKey !== oldSearchKey &&
        ((newSearchKey?.includes("tab=") && oldSearchKey?.includes("tab=")) ||
          (newSearchKey?.includes("s=") && oldSearchKey?.includes("s=")))
      ) {
        return true;
      }

      return false;
    },
    []
  );

  // Preload related pages to make transitions feel faster
  const preloadRelatedPages = useCallback(() => {
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
          const tabs = ["explore", "following", "top", "search"];
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

  // Start transition with appropriate timing based on navigation type
  const startTransition = useCallback(
    (isTab: boolean) => {
      // For tab changes, we don't animate at all
      if (isTab) {
        setNavigationType("tab");
        setIsTransitioning(false);
        return;
      }

      // Cancel any in-progress animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      // If already animating, don't restart animation
      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;

      // Real page change - animate with appropriate duration
      setIsPageTransitioning(true);
      setIsTransitioning(true);
      setNavigationType("page");

      // Update the stable key for new page animations
      setStableKey(pathname);

      // Use requestAnimationFrame for smoother animations
      const startTime = performance.now();
      // Shorter duration for more subtlety - match with Framer transition
      const duration = 150;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;

        if (elapsed >= duration) {
          // Animation complete
          setIsPageTransitioning(false);
          setIsTransitioning(false);
          isAnimatingRef.current = false;
          animationRef.current = null;
        } else {
          // Continue animation
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      // Start the animation loop
      animationRef.current = requestAnimationFrame(animate);
    },
    [setIsPageTransitioning, setIsTransitioning, setNavigationType, pathname]
  );

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const currentSearchKey =
      searchParams?.get("tab") || searchParams?.get("s") || "";

    // Skip initial render
    if (prevPathname === "" && prevSearchKey === "") {
      setPrevPathname(pathname);
      setPrevSearchKey(currentSearchKey);
      setStableKey(pathname);
      return;
    }

    // Check if this is a tab change or a real page change
    const tabChange = isTabChange(
      pathname,
      prevPathname,
      currentSearchKey,
      prevSearchKey
    );

    // Only trigger animations when needed
    if (!tabChange && pathname !== prevPathname) {
      // Real page change
      startTransition(false);
    } else if (tabChange) {
      // Tab change - NO animation
      startTransition(true);
    }

    // Preload related pages for better UX
    preloadRelatedPages();

    // Update previous values for next comparison
    setPrevPathname(pathname);
    setPrevSearchKey(currentSearchKey);
  }, [
    pathname,
    searchParams,
    prevPathname,
    prevSearchKey,
    isTabChange,
    preloadRelatedPages,
    startTransition,
  ]);

  // Choose animation variants - no animation for tabs
  const currentVariants =
    lastNavigationType === "tab" ? noAnimationVariants : pageVariants;

  return (
    <PageTransitionContext.Provider value={{ isPageTransitioning }}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          // Use stableKey which only changes on actual page changes
          key={stableKey}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={currentVariants}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </PageTransitionContext.Provider>
  );
}
