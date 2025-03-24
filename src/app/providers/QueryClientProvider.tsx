"use client";
import { ReactNode, useState, memo, useCallback, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createOptimizedQueryClient,
  prepareForNavigation,
} from "@/utils/queryOptimizer";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools,
    ),
  { ssr: false }, // Ensure it's only loaded on the client
);

interface QueryProviderProps {
  children: ReactNode;
}

const QueryProvider = ({ children }: QueryProviderProps) => {
  // Use optimized query client with better defaults
  const [queryClient] = useState(() => createOptimizedQueryClient());
  const pathname = usePathname();
  const isDev = process.env.NODE_ENV === "development";

  // Pre-cache key routes for faster transitions
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Use intersection observer to prefetch links when they come into view
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              entry.target instanceof HTMLAnchorElement
            ) {
              const href = entry.target.getAttribute("href");
              if (href && href.startsWith("/")) {
                // Prefetch this route in the background
                const prefetcher = document.createElement("link");
                prefetcher.rel = "prefetch";
                prefetcher.href = href;
                document.head.appendChild(prefetcher);
              }
            }
          });
        },
        { rootMargin: "200px" },
      );

      // Observe all anchor links
      document.querySelectorAll('a[href^="/"]').forEach((link) => {
        observer.observe(link);
      });

      return () => observer.disconnect();
    }
  }, [pathname]);

  // Optimization for page transitions
  const handleBeforeNavigate = useCallback(() => {
    // Prepare for navigation by cleaning up unnecessary queries
    prepareForNavigation(queryClient, pathname);
  }, [queryClient, pathname]);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeNavigate);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeNavigate);
    };
  }, [handleBeforeNavigate]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDev && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(QueryProvider);
