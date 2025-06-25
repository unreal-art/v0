"use client";
import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useTransition,
  Suspense,
} from "react";
import Tabs from "../../creations/components/Tabs";
import PhotoGridTwo from "../../creations/components/PhotoGridTwo";
import { useParams, useSearchParams } from "next/navigation";
import { indexOf } from "lodash";
import { POST_GROUPS } from "@/app/libs/constants";
import { useUser } from "@/hooks/useUser";
import { TabText } from "@/stores/creationAndProfileStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import { supabase } from "$/supabase/client";
import { Post } from "$/types/data.types";
import { ErrorBoundary } from "@/app/components/errorBoundary";
import OptimizedImage from "@/app/components/OptimizedImage";
import {
  getIsDraftPostsByUser,
  getPinnedPostsByUser,
  getPostsByUser,
  getPrivatePostsByUser,
  getUserLikedPosts,
} from "@/queries/post/getPostsByUser";
import { getMintedPostsByUser } from "@/queries/post/getMintedPostsByUser";
import { useCreationAndProfileStore } from "@/stores/creationAndProfileStore";
import { useMintPosts } from "@/hooks/useMintPosts";
import { MintIcon } from "@/app/components/icons";
import { getImage } from "../../formattedPhotos";

export default function ProfileView() {
  const searchParams = useSearchParams();
  const s = searchParams.get("s");
  const { id } = useParams();
  const { userId } = useUser();
  const { profileTab, initFromUrl, setProfileTab } =
    useCreationAndProfileStore();
    
  // Fetch minted posts for this user (will use React Query caching)
  const { data: mintedPosts, isLoading: mintedLoading } = useMintPosts(id as string);

  // Add isPending state with useTransition for smooth tab transitions
  const [isPending, startTransition] = useTransition();

  // Local state for tab index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize from URL on component mount
  useEffect(() => {
    if (s) {
      console.log("ProfileView - Initializing from URL:", s);
      startTransition(() => {
        initFromUrl("profile", s);
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
          setProfileTab(tabKey as any);
        }
      });
    },
    [setProfileTab]
  );

  // Sync with store changes
  useEffect(() => {
    if (profileTab) {
      const index = indexOf(POST_GROUPS, profileTab.toUpperCase());
      if (index >= 0 && index !== currentIndex) {
        startTransition(() => {
          setCurrentIndex(index);
        });
      }
    }
  }, [profileTab, currentIndex]);

  const currentTabName = useMemo(() => {
    return s || profileTab || "Public";
  }, [s, profileTab]);

  const {
    isLoading: queryIsLoading,
    isError,
    error,
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["profile_posts", currentTabName, id],
    queryFn: async ({ pageParam = 0 }) => {
      let result: Post[] = [];
      const searchType = currentTabName.toUpperCase();

      if (searchType === "PUBLIC") {
        result = await getPostsByUser(supabase, pageParam, id as string);
      } else if (searchType === "PRIVATE") {
        result = await getPrivatePostsByUser(supabase, pageParam, id as string);
      } else if (searchType === "LIKED") {
        result = await getUserLikedPosts(supabase, pageParam, id as string);
      } else if (searchType === "PINNED") {
        result = await getPinnedPostsByUser(supabase, pageParam, id as string);
      } else if (searchType === "MINTED") {
        result = await getMintedPostsByUser(supabase, pageParam, id as string);
      } else if (searchType === "DRAFT") {
        result = await getIsDraftPostsByUser(supabase, pageParam, id as string);
      } else {
        result = await getPostsByUser(supabase, pageParam, id as string);
      }

      return {
        data: result,
        nextCursor: result.length > 0 ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: 1000 * 60, // 1 minute - good balance between freshness and performance
    gcTime: 1000 * 60 * 10, // Keep unused data for 10 minutes
    refetchOnMount: "always", // Always check for updates but use stale data while fetching
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus to prevent flickering
  });

  // Combine isPending with queryIsLoading for a comprehensive loading state
  const isLoading = isPending || queryIsLoading;

  const contentConfig = useMemo(
    () => ({
      Public: {
        title: "Public" as TabText,
        content: "You have not published anything yet.",
        subContent: "Tap your inner artist and create something amazing!",
      },
      Private: {
        title: "Private" as TabText,
        content: "You don't have any private post.",
        subContent: "You can go ahead and create one.",
      },
      Liked: {
        title: "Liked" as TabText,
        content: "You haven't liked anything yet.",
        subContent: "Find something you love and tap that 🤍!",
      },
      Pinned: {
        title: "Pinned" as TabText,
        content: "You haven't pinned anything yet.",
        subContent: "Find something you love and pin it!",
      },
      Minted: {
        title: "Minted" as TabText,
        content: "You haven't minted anything yet.",
        subContent: "Find something you love and mint it!",
      },
      Draft: {
        title: "Draft" as TabText,
        content: "You haven't saved anything yet.",
        subContent: "Create something you love to post later",
      },
    }),
    []
  );

  const renderContent = useCallback(() => {
    const configs = ["Public", "Private", "Liked", "Pinned", "Minted", "Draft"];
    const config =
      contentConfig[configs[currentIndex] as keyof typeof contentConfig];
    if (!config) return null;

    // Current tab name for reference
    const currentTab = configs[currentIndex];
    
    return (
      <ErrorBoundary
        componentName={`ProfileTab-${configs[currentIndex]}`}
        fallback={
          <div className="flex flex-col items-center justify-center w-full py-8">
            <p className="text-center text-lg text-primary-6 mb-4">
              Unable to load {configs[currentIndex]} content
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
        <Suspense fallback={
          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(null).map((_, i) => (
                <Skeleton key={i} height={300} baseColor="#1a1a1a" highlightColor="#333" className="rounded-lg" />
              ))}
            </div>
          </div>
        }>
          {/* If we're on the Pinned tab and have minted posts, show them above the pinned posts */}
          {/* Minted posts are now in their own tab */}
          
          <PhotoGridTwo
            {...config}
            data={data}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }, [
    isLoading,
    isPending,
    isError,
    error,
    data,
    currentIndex,
    contentConfig,
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
          hideDraft={userId !== id}
          section="profile"
        />
      </div>

      <div className="w-full ">{renderContent()}</div>
    </div>
  );
}
