import { useInfiniteQuery } from "@tanstack/react-query";
import { searchPostsPaginated } from "@/queries/post/searchPostsPaginated";

export const useSearchPostsInfinite = (keyword: string, limit = 10) => {
  return useInfiniteQuery({
    queryKey: ["posts", keyword.trim(), limit], // ✅ Ensures key consistency
    queryFn: async ({ pageParam = 1 }) => {
      const result = await searchPostsPaginated(keyword, pageParam, limit);
      return {
        data: result ?? [],
        nextCursor: result.length === limit ? pageParam + 1 : undefined, // ✅ Prevents unnecessary extra calls
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    enabled: keyword.trim().length > 2, // ✅ Prevents empty queries & ensures keyword is meaningful
    staleTime: 1000 * 60 * 5, // ✅ Caches results for 5 minutes
  });
};
