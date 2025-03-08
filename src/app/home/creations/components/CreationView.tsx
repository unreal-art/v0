"use client";
import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useTransition,
} from "react";
import Tabs from "./Tabs";
import PhotoGridTwo from "./PhotoGridTwo";
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

// Memoize tab configurations to prevent recreating on each render
const TAB_CONFIGS = {
  Public: {
    title: "Public" as const,
    content: "You have not published anything yet.",
    subContent: "Tap your inner artist and create something amazing!",
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
  const { creationTab, initFromUrl, setCreationTab } =
    useCreationAndProfileStore();

  // Add isPending state with useTransition for smooth tab transitions
  const [isPending, startTransition] = useTransition();

  // Local state for tab index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize from URL on component mount
  useEffect(() => {
    if (s) {
      console.log("CreationView - Initializing from URL:", s);
      startTransition(() => {
        initFromUrl("creation", s);
      });

      // Set the local index state
      const index = indexOf(POST_GROUPS, s.toUpperCase());
      if (index >= 0) {
        startTransition(() => {
          setCurrentIndex(index);
        });
      }
    }
  }, []);

  // Create a wrapper function for tab changes that uses transitions
  const handleTabChange = useCallback(
    (index: number) => {
      startTransition(() => {
        setCurrentIndex(index);
        // Get the tab text from the index
        const tabText = POST_GROUPS[index]?.toLowerCase();
        if (tabText) {
          const tabKey =
            tabText.charAt(0).toUpperCase() + tabText.slice(1).toLowerCase();
          setCreationTab(tabKey as any);
        }
      });
    },
    [setCreationTab]
  );

  // Sync with store changes
  useEffect(() => {
    if (creationTab) {
      const index = indexOf(POST_GROUPS, creationTab.toUpperCase());
      if (index >= 0 && index !== currentIndex) {
        startTransition(() => {
          setCurrentIndex(index);
        });
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
    isLoading: queryIsLoading,
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
    staleTime: 1000 * 60, // 1 minute - good balance between freshness and performance
    gcTime: 1000 * 60 * 10, // Keep unused data for 10 minutes
    refetchOnMount: "always", // Always check for updates but use stale data while fetching
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus to prevent flickering
  });

  // Combine isPending with queryIsLoading for a comprehensive loading state
  const isLoading = isPending || queryIsLoading;

  // Get current tab config
  const currentConfig = useMemo(() => {
    const currentTab = s || creationTab || "Public";
    const configKey = (currentTab.charAt(0).toUpperCase() +
      currentTab.slice(1).toLowerCase()) as TabConfigKey;
    return TAB_CONFIGS[configKey] || TAB_CONFIGS.Public;
  }, [s, creationTab]);

  // Render content based on loading, error, and data states
  const renderContent = useCallback(() => {
    // Handle error cases
    if (isError && !isPending) {
      return (
        <div className="w-full flex justify-center items-center min-h-[200px] text-red-500">
          {error instanceof Error
            ? error.message
            : "An error occurred while loading posts"}
        </div>
      );
    }

    // During transitions or loading, show loading state in PhotoGridTwo
    // Or when we have data, let PhotoGridTwo handle the display
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
    isPending,
    isError,
    error,
    data,
    currentConfig,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  ]);

  // Handle error state
  if (isError && !isPending)
    return (
      <div className="w-full">
        <div className="w-full mb-4">
          <Tabs
            currentIndex={currentIndex}
            setCurrentIndex={handleTabChange}
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
    );

  return (
    <div className="w-full">
      <div className="w-full mb-4">
        <Tabs
          currentIndex={currentIndex}
          setCurrentIndex={handleTabChange}
          hideDraft={false}
          section="creation"
        />
      </div>

      <div className="w-full">{renderContent()}</div>
    </div>
  );
}
