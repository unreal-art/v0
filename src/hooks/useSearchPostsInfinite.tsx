import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { searchPostsPaginated } from "@/queries/post/searchPostsPaginated";
import { useEffect, useState, useMemo, useCallback } from "react";
import { normalizeEntity } from "@/utils/queryOptimizer";
import { log, logError } from "@/utils/sentryUtils";

// Optimized hook for searching posts with efficient data loading and caching
export const useSearchPostsInfinite = (keyword: string, limit = 10) => {
  const queryClient = useQueryClient();

  // Debounce the search keyword to prevent excessive API calls
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [keyword]);

  // Memoize the normalized keyword to prevent unnecessary query key changes
  const normalizedKeyword = useMemo(
    () => debouncedKeyword.trim().toLowerCase(),
    [debouncedKeyword]
  );

  // The actual query using the debounced keyword
  const result = useInfiniteQuery({
    queryKey: ["posts", "search", normalizedKeyword, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await searchPostsPaginated(
        normalizedKeyword,
        pageParam,
        limit
      );

      // Normalize the post data for reuse
      result.forEach((post) => {
        normalizeEntity("posts", post);
      });

      return {
        data: result ?? [],
        nextCursor: result.length === limit ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.data.length < limit ? undefined : lastPage.nextCursor,
    enabled: normalizedKeyword.length > 2, // Only search with meaningful keywords
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    gcTime: 1000 * 60 * 15, // Keep unused results in cache for 15 minutes
  });

  // Prefetch next page when close to the end
  const prefetchNextPage = useCallback(() => {
    if (result.hasNextPage && !result.isFetchingNextPage) {
      const nextPageParam =
        result.data?.pages[result.data.pages.length - 1]?.nextCursor;
      if (nextPageParam) {
        queryClient.prefetchInfiniteQuery({
          queryKey: ["posts", "search", normalizedKeyword, limit],
          queryFn: ({ pageParam = nextPageParam }) =>
            searchPostsPaginated(normalizedKeyword, pageParam, limit),
          initialPageParam: nextPageParam,
        });
      }
    }
  }, [
    result.hasNextPage,
    result.isFetchingNextPage,
    result.data?.pages,
    queryClient,
    normalizedKeyword,
    limit,
  ]);

  // Expose the prefetch function for optimization
  return {
    ...result,
    prefetchNextPage,
    debouncedKeyword: normalizedKeyword,
  };
};
