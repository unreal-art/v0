"use client";

import { supabase } from "$/supabase/client";
import {
  dehydrate,
  HydrationBoundary,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import {
  getFollowingPosts,
  getPosts,
  getTopPosts,
} from "@/queries/post/getPosts";
import Loading from "../loading";

// Define a type for the search type to improve type safety
type SearchType = "EXPLORE" | "FOLLOWING" | "TOP" | string | undefined;

// Define response type to ensure proper typing
interface QueryResponse {
  data: any[];
  nextCursor: number | undefined;
}

export default function PostsProvider({
  children,
  searchType,
}: {
  children: React.ReactNode;
  searchType?: string;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const isMounted = useRef(true);

  // Normalize searchType for consistency
  const normalizedSearchType =
    (searchType?.toUpperCase() as SearchType) || "EXPLORE";

  useEffect(() => {
    // Set up mounted ref for cleanup
    isMounted.current = true;

    const prefetchData = async () => {
      try {
        // Reset state on new prefetch
        setError(null);
        setIsHydrated(false);

        // Prefetch initial data based on search type
        await queryClient.prefetchInfiniteQuery({
          queryKey: ["posts", normalizedSearchType.toLowerCase()],
          queryFn: async ({ pageParam = 0 }) => {
            try {
              let result = [];

              // Select the right query function based on search type
              switch (normalizedSearchType) {
                case "EXPLORE":
                  result = await getPosts(supabase, pageParam);
                  break;
                case "FOLLOWING":
                  result = await getFollowingPosts(supabase, pageParam);
                  break;
                case "TOP":
                  result = await getTopPosts(supabase, pageParam);
                  break;
                default:
                  result = await getPosts(supabase, pageParam);
              }

              // Ensure result is an array to prevent runtime errors
              if (!Array.isArray(result)) {
                console.warn(
                  "Expected array result from API but got:",
                  typeof result,
                );
                result = [];
              }

              return {
                data: result,
                nextCursor: result.length > 0 ? pageParam + 1 : undefined,
              } as QueryResponse;
            } catch (err) {
              console.error("Error fetching page data:", err);
              // Return empty result instead of throwing to prevent query failure
              return { data: [], nextCursor: undefined } as QueryResponse;
            }
          },
          initialPageParam: 0,
          getNextPageParam: (lastPage) => {
            // Safe access with type checking
            if (!lastPage || typeof lastPage !== "object") return undefined;
            return "nextCursor" in lastPage ? lastPage.nextCursor : undefined;
          },
        });

        // Only update state if component is still mounted
        if (isMounted.current) {
          setIsHydrated(true);
        }
      } catch (err) {
        console.error("Error in data prefetching:", err);
        // Only update state if component is still mounted
        if (isMounted.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          // Set hydrated to true even on error to render children with empty state
          setIsHydrated(true);
        }
      }
    };

    prefetchData();

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted.current = false;
    };
  }, [normalizedSearchType, queryClient]);

  // Handle error state
  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded">
        <p className="font-medium">Error loading data:</p>
        <p>{error.message}</p>
      </div>
    );
  }

  // Show loading state until data is fetched
  if (!isHydrated) {
    return <Loading />;
  }

  // Render children with hydrated query client
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
