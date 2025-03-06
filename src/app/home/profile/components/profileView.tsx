"use client";
import { useCallback, useMemo } from "react";
import Tabs from "../../creations/components/Tabs";
import PhotoGridTwo from "../../creations/components/PhotoGridTwo";
import { useParams, useSearchParams } from "next/navigation";
import { indexOf } from "lodash";
import { POST_GROUPS } from "@/app/libs/constants";
import { useUser } from "@/hooks/useUser";
import { TabText } from "../../creations/components/Tabs";
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

export default function ProfileView() {
  const searchParams = useSearchParams();
  const s = searchParams.get("s");
  const { id } = useParams();
  const { userId } = useUser();

  const currentIndex = useMemo(() => {
    if (!s) return 0;
    return indexOf(POST_GROUPS, s?.toUpperCase());
  }, [s]);

  const {
    isLoading,
    isError,
    error,
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["creation_posts", s || "public"],
    queryFn: async ({ pageParam = 0 }) => {
      let result: Post[] = [];
      if (s?.toUpperCase() === "PUBLIC") {
        result = await getPostsByUser(supabase, pageParam, id as string);
      } else if (s?.toUpperCase() === "PRIVATE") {
        result = await getPrivatePostsByUser(supabase, pageParam, id as string);
      } else if (s?.toUpperCase() === "LIKED") {
        result = await getUserLikedPosts(supabase, pageParam, id as string);
      } else if (s?.toUpperCase() === "PINNED") {
        result = await getPinnedPostsByUser(supabase, pageParam, id as string);
      } else if (s?.toUpperCase() === "DRAFT") {
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
  });

  const contentConfig = useMemo(
    () => ({
      Public: {
        title: "Public" as TabText,
        content: "You haven't liked anything yet.",
        subContent: "Find something you love and tap that 🤍!",
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
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
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
        <div className="text-center text-red-500">
          {"message" in error ? error.message : "An error occurred"}
        </div>
      );
    }

    const configs = ["Public", "Private", "Liked", "Pinned", "Draft"];
    const config =
      contentConfig[configs[currentIndex] as keyof typeof contentConfig];
    if (!config) return null;

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
    <div className="w-full">
      <div className="w-full mb-4">
        <Tabs
          currentIndex={currentIndex}
          setCurrentIndex={() => {}}
          hideDraft={userId !== id}
        />
      </div>

      <div className="w-full">{renderContent()}</div>
    </div>
  );
}
