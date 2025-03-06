"use client";
import { useMemo, useCallback } from "react";
import Tabs from "./Tabs";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { indexOf } from "lodash";
import { POST_GROUPS } from "@/app/libs/constants";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import {
  getIsDraftPostsByUser,
  getPinnedPostsByUser,
  getPostsByUser,
  getPrivatePostsByUser,
  getUserLikedPosts,
} from "@/queries/post/getPostsByUser";
import { useUser } from "@/hooks/useUser";
import { Post } from "$/types/data.types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


// Dynamically import PhotoGridTwo
const PhotoGridTwo = dynamic(() => import("./PhotoGridTwo"), {
  loading: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center max-w-[1536px]">
        {Array(12)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              // style={{ width: size.width, height: size.height }}
              className="relative grid-cols-1"
            >
              <Skeleton
                height="100%"
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
            </div>
          ))}
      </div>
  ),
});

// Memoize tab configurations to prevent recreating on each render
const TAB_CONFIGS = {
  Public: {
    title: "Public" as const,
    content: "You haven't liked anything yet.",
    subContent: "Find something you love and tap that 🤍!",
  },
  Private: {
    title: "Private" as const,
    content: "You don't have any private posts.",
    subContent: "You can go ahead and create one.",
  },
  Liked: {
    title: "Liked" as const,
    content: "You haven't liked anything yet.",
    subContent: "Find something you love and tap that 🤍!",
  },
  Pinned: {
    title: "Pinned" as const,
    content: "You haven't pinned anything yet.",
    subContent: "Find something you love and pin it!",
  },
  Draft: {
    title: "Draft" as const,
    content: "You haven't saved anything yet.",
    subContent: "Create something you love to post later",
  },
} as const;

type TabConfigKey = keyof typeof TAB_CONFIGS;

interface QueryResult {
  data: Post[];
  nextCursor?: number;
}

// Memoize the query function to prevent recreating on each render
const createQueryFn =
  (userId: string | null, searchType: string) =>
  async ({ pageParam = 0 }: { pageParam?: unknown }) => {
    const page = typeof pageParam === "number" ? pageParam : 0;
    let result: Post[] = [];

    switch (searchType.toUpperCase()) {
      case "PRIVATE":
        result = await getPrivatePostsByUser(supabase, page, userId || "");
        break;
      case "LIKED":
        result = await getUserLikedPosts(supabase, page, userId || "");
        break;
      case "PINNED":
        result = await getPinnedPostsByUser(supabase, page, userId || "");
        break;
      case "DRAFT":
        result = await getIsDraftPostsByUser(supabase, page, userId || "");
        break;
      default:
        result = await getPostsByUser(supabase, page, userId || "");
    }

    return {
      data: result,
      nextCursor: result.length > 0 ? page + 1 : undefined,
    };
  };

export default function CreationView() {
  const searchParams = useSearchParams();
  const s = searchParams.get("s");
  const { userId } = useUser();

  // Memoize current index calculation
  const currentIndex = useMemo(() => {
    if (!s) return 0;
    return indexOf(POST_GROUPS, s.toUpperCase());
  }, [s]);

  // Memoize the query function
  const queryFn = useCallback(
    (context: { pageParam?: unknown }) =>
      createQueryFn(userId, s || "")(context),
    [userId, s]
  );

  // Single query that handles all types of posts
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useInfiniteQuery<QueryResult>({
    queryKey: ["creation_posts", s || "public", userId],
    queryFn,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!userId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data for 10 minutes
  });

  // Get current tab config
  const currentConfig = useMemo(() => {
    const configKey = (
      s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "Public"
    ) as TabConfigKey;
    return TAB_CONFIGS[configKey];
  }, [s]);

  // Memoize the error component
  const ErrorComponent = useMemo(
    () => (
      <div className="w-full">
        <div className="w-full mb-4">
          <Tabs
            currentIndex={currentIndex}
            setCurrentIndex={() => {}}
            hideDraft={false}
          />
        </div>
        <div className="w-full flex justify-center items-center min-h-[200px] text-red-500">
          {error instanceof Error
            ? error.message
            : "An error occurred while loading posts"}
        </div>
      </div>
    ),
    [error, currentIndex]
  );

  // Handle error state
  if (isError) return ErrorComponent;

  // Handle loading state when no data is available yet
  if (isLoading && !data) {
    return (
      <div className="w-full">
        <div className="w-full mb-4">
          <Tabs
            currentIndex={currentIndex}
            setCurrentIndex={() => {}}
            hideDraft={false}
          />
        </div>
        <PhotoGridTwo
          {...currentConfig}
          data={undefined}
          isLoading={true}
          hasNextPage={false}
          fetchNextPage={() => {}}
          isFetchingNextPage={false}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full mb-4">
        <Tabs
          currentIndex={currentIndex}
          setCurrentIndex={() => {}}
          hideDraft={false}
        />
      </div>

      <div className="w-full">
        <PhotoGridTwo
          {...currentConfig}
          data={data}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </div>
  );
}
