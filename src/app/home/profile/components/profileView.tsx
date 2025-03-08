"use client";
import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useTransition,
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
import {
  getIsDraftPostsByUser,
  getPinnedPostsByUser,
  getPostsByUser,
  getPrivatePostsByUser,
  getUserLikedPosts,
} from "@/queries/post/getPostsByUser";
import { useCreationAndProfileStore } from "@/stores/creationAndProfileStore";

export default function ProfileView() {
  const searchParams = useSearchParams();
  const s = searchParams.get("s");
  const { id } = useParams();
  const { userId } = useUser();
  const { profileTab, initFromUrl, setProfileTab } =
    useCreationAndProfileStore();

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
        content: "You haven't created anything yet.",
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
      Draft: {
        title: "Draft" as TabText,
        content: "You haven't saved anything yet.",
        subContent: "Create something you love to post later",
      },
    }),
    []
  );

  const renderContent = useCallback(() => {
    // Handle error cases but don't show errors during transitions
    if (isError && !isPending) {
      return (
        <div className="text-center text-red-500">
          {"message" in error ? error.message : "An error occurred"}
        </div>
      );
    }

    const configs = ["Public", "Private", "Liked", "Pinned", "Draft"];
    const config =
      contentConfig[configs[currentIndex] as keyof typeof contentConfig];
    if (!config) return null;

    // During transitions or loading, show loading state in PhotoGridTwo
    // Or when we have data, let PhotoGridTwo handle the display
    return (
      <PhotoGridTwo
        {...config}
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
