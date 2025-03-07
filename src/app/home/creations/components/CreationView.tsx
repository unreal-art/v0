"use client";
import { useMemo, useCallback, useState, useEffect } from "react";
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
import { useCreationAndProfileStore } from "@/stores/creationAndProfileStore";

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
            <Skeleton height="100%" baseColor="#1a1a1a" highlightColor="#333" />
          </div>
        ))}
    </div>
  ),
});

// Memoize tab configurations to prevent recreating on each render
const TAB_CONFIGS = {
  Public: {
    title: "Public" as const,
    content: "You haven't published any post.",
    subContent: "Be creative and publish a great post!",
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
  const { creationTab, initFromUrl } = useCreationAndProfileStore();

  // Local state for tab index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize from URL on component mount
  useEffect(() => {
    if (s) {
      console.log("CreationView - Initializing from URL:", s);
      initFromUrl("creation", s);

      // Set the local index state
      const index = indexOf(POST_GROUPS, s.toUpperCase());
      if (index >= 0) {
        setCurrentIndex(index);
      }
    }
  }, []);

  // Sync with store changes
  useEffect(() => {
    if (creationTab) {
      const index = indexOf(POST_GROUPS, creationTab.toUpperCase());
      if (index >= 0 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [creationTab, currentIndex]);

  // Memoize the query function
  const queryFn = useCallback(
    (context: { pageParam?: unknown }) =>
      createQueryFn(userId, s || creationTab || "")(context),
    [userId, s, creationTab]
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
    queryKey: ["creation_posts", s || creationTab || "public", userId],
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
    const currentTab = s || creationTab || "Public";
    const configKey = (currentTab.charAt(0).toUpperCase() +
      currentTab.slice(1).toLowerCase()) as TabConfigKey;
    return TAB_CONFIGS[configKey] || TAB_CONFIGS.Public;
  }, [s, creationTab]);

  // Render content based on loading, error, and data states - similar to ProfileView
  const renderContent = useCallback(() => {
    // Show loading skeleton on initial load or refresh
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center max-w-[1536px]">
          {Array(12)
            .fill(null)
            .map((_, index) => (
              <Skeleton
                key={index}
                height={200}
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
            ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="w-full flex justify-center items-center min-h-[200px] text-red-500">
          {error instanceof Error
            ? error.message
            : "An error occurred while loading posts"}
        </div>
      );
    }

    return (
      <PhotoGridTwo
        {...currentConfig}
        data={data}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    );
  }, [
    isLoading,
    isError,
    error,
    data,
    currentConfig,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  ]);

  // Memoize the error component
  const ErrorComponent = useMemo(
    () => (
      <div className="w-full">
        <div className="w-full mb-4">
          <Tabs
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            hideDraft={false}
            section="creation"
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

  return (
    <div className="w-full">
      <div className="w-full mb-4">
        <Tabs
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          hideDraft={false}
          section="creation"
        />
      </div>

      <div className="w-full">{renderContent()}</div>
    </div>
  );
}
