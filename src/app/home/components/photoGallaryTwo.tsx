"use client";
import { ColumnsPhotoAlbum, RenderPhotoContext } from "react-photo-album";
import "react-photo-album/columns.css";
import { useEffect, useState } from "react";
import { MD_BREAKPOINT } from "@/app/libs/constants";
//import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";
import PhotoOverlay, { ExtendedRenderPhotoContext } from "./photoOverlay";

import Image from "next/image";
import ImageView from "./imageView";
// import { usePostsQuery } from "@/hooks/usePostsQuery";
import { supabase } from "$/supabase/client";

import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "./InfiniteScroll";
import { formattedPhotos } from "../formattedPhotos";
import { Post } from "$/types/data.types";
import { useParams, useSearchParams } from "next/navigation";
// import { getAuthorUserName } from "@/queries/post/getAuthorUserName";
import useAuthorUsername from "@/hooks/useAuthorUserName";
import useAuthorImage from "@/hooks/useAuthorImage";
import { useUser } from "@/hooks/useUser";
import {
  getOtherIsDraftPostsByUser,
  getOtherPostsByUser,
  getPostsByUser,
} from "@/queries/post/getPostsByUser";
import { usePost } from "@/hooks/usePost";

export default function PhotoGallaryTwo({}) {
  const [imageIndex, setImageIndex] = useState(-1);
  const [columns, setColumns] = useState(
    window?.innerWidth < MD_BREAKPOINT ? 2 : 4
  );
  const { userId } = useUser();
  const searchParams = useSearchParams();
  const a = searchParams.get("a");
  const { id } = useParams();

  // Ensure id is valid before making API call
  const postId = id ? parseInt(id as string) : null;

  const { data: post } = usePost(postId);

  // Ensure loading state is handled before rendering and a can be any text
  // if (!a && loading) {
  //   return null; // or a loading spinner if needed
  // }

  const {
    isLoading,
    isError,
    error,
    data,
    isFetchingNextPage,
    // isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "other_posts_by_user",
      `${post?.author} "_" ${a} || "other_posts"`,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      let result: Post[] = [];

      if (a) {
        // completing image generation
        result = await getOtherIsDraftPostsByUser(
          supabase,
          pageParam,
          Number(postId),
          post?.author
        );
      } else {
        // viewing other user's posts
        result = await getOtherPostsByUser(
          supabase,
          pageParam,
          Number(postId),
          post?.author
        );
      }

      return {
        data: result ?? [],
        nextCursor: result.length === 10 ? pageParam + 1 : undefined, // ✅ Ensure cursor is only set if limit is reached
      };
    },
    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      if (!lastPage?.data || !Array.isArray(lastPage.data)) {
        return undefined;
      }

      if (lastPage.data.length < 10) {
        return undefined; // ✅ No more pages if the last page has less than `limit`
      }

      return lastPage.nextCursor; // ✅ Correctly use the cursor for pagination
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return; // ✅ Ensure it runs only on the client

    const handleResize = () => {
      setColumns(window.innerWidth < MD_BREAKPOINT ? 2 : 4);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // ✅ Call initially to set correct columns

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleImageIndex = (context: RenderPhotoContext) => {
    setImageIndex(context.index);
  };

  // console.log(isLoading, isFetching, isError);

  if (isError) {
    return (
      <p className="wrapper">{"message" in error ? error.message : error}</p>
    );
  }

  if (!data || data.pages.length === 0 || data.pages[0].data.length === 0) {
    return <p className="text-center">No Data found.</p>;
  }

  // console.log(isLoading);

  return (
    <div className="w-full">
      <InfiniteScroll
        isLoadingInitial={isLoading || (!data && !error)} // during initial load or no data
        isLoadingMore={isFetchingNextPage}
        loadMore={() => hasNextPage && fetchNextPage()}
        hasNextPage={hasNextPage}
      >
        <ColumnsPhotoAlbum
          photos={formattedPhotos(data?.pages ?? [])}
          columns={columns}
          spacing={4}
          render={{
            extras: (_, context) => (
              <PhotoWithAuthor
                context={context as ExtendedRenderPhotoContext}
                handleImageIndex={handleImageIndex}
              />
            ),
          }}
        />
      </InfiniteScroll>
      <ImageView
        photo={
          imageIndex > -1 && formattedPhotos(data?.pages ?? [])[imageIndex]
        }
        setImageIndex={setImageIndex}
      />
    </div>
  );
}

function PhotoWithAuthor({
  context,
  handleImageIndex,
}: {
  context: ExtendedRenderPhotoContext;
  handleImageIndex: (context: RenderPhotoContext) => void;
}) {
  const authorId = context.photo.author || ""; // Ensure it's always a string

  const { data: userName, isLoading: isLoading } = useAuthorUsername(authorId);
  const { data: image, isLoading: imageLoading } = useAuthorImage(authorId);
  return (
    <PhotoOverlay
      setImageIndex={() => handleImageIndex(context)}
      context={context}
    >
      <div className="absolute flex items-center gap-1 bottom-2 left-2">
        {!isLoading && !imageLoading && userName && (
          <>
            <div className="rounded-full">
              {image ? (
                <Image
                  className="rounded-full border-[1px] border-primary-3 drop-shadow-lg"
                  src={image}
                  width={24}
                  height={24}
                  alt="profile"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full" /> // Fallback avatar
              )}
            </div>
            <p className="font-semibold text-sm drop-shadow-lg">{userName}</p>
          </>
        )}
      </div>
    </PhotoOverlay>
  );
}
