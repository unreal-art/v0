"use client";

import { supabase } from "$/supabase/client";
import {
  dehydrate,
  HydrationBoundary,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getFollowingPosts,
  getPosts,
  getTopPosts,
} from "@/queries/post/getPosts";
import Loading from "../loading";

export default function PostsProvider({
  children,
  searchType,
}: {
  children: React.ReactNode;
  searchType?: string;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchData = async () => {
      // Prefetch initial data based on search type
      await queryClient.prefetchInfiniteQuery({
        queryKey: ["posts", searchType || "explore"],
        queryFn: async ({ pageParam = 0 }) => {
          let result = [];
          if (searchType?.toUpperCase() === "EXPLORE") {
            result = await getPosts(supabase, pageParam);
          } else if (searchType?.toUpperCase() === "FOLLOWING") {
            result = await getFollowingPosts(supabase, pageParam);
          } else if (searchType?.toUpperCase() === "TOP") {
            result = await getTopPosts(supabase, pageParam);
          } else {
            result = await getPosts(supabase, pageParam);
          }
          return {
            data: result ?? [],
            nextCursor: result.length > 0 ? pageParam + 1 : undefined,
          };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: { nextCursor: any }) =>
          lastPage?.nextCursor ?? undefined,
      });

      setIsHydrated(true);
    };

    prefetchData();
  }, [searchType, queryClient]);

  if (!isHydrated) {
    return <Loading />; //show loading state until data is fetched
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
