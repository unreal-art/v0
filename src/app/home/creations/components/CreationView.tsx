"use client";
import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useTransition,
  Suspense,
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
import { ErrorBoundary } from "@/app/components/errorBoundary";

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

  // Render the current tab content with proper error handling and loading states
  const renderTabContent = useCallback(() => {
    const currentTabConfig = Object.values(TAB_CONFIGS)[currentIndex];

    return (
      <ErrorBoundary
        fallback={
          <div className="flex flex-col items-center justify-center w-full py-8">
            <p className="text-center text-lg text-primary-6 mb-4">
              Unable to load {currentTabConfig.title.toLowerCase()} content
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-8 hover:bg-primary-7 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {Array(8)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="aspect-square relative">
                    <Skeleton
                      height="100%"
                      width="100%"
                      className="rounded-lg absolute inset-0"
                      baseColor="#1a1a1a"
                      highlightColor="#333"
                    />
                  </div>
                ))}
            </div>
          }
        >
          <PhotoGridTwo
            title={currentTabConfig.title}
            content={currentTabConfig.content}
            subContent={currentTabConfig.subContent}
            data={data}
            isLoading={isLoading || isPending}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }, [
    currentIndex,
    data,
    isLoading,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  ]);

  return (
    <div className="w-full ">
        <div className="w-full mb-4">
      <Tabs
        currentIndex={currentIndex}
        setCurrentIndex={handleTabChange}
        section="creation"
        hideDraft={false}
      />
      </div>
      {renderTabContent()}
    </div>
  );
}
