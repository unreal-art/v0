"use client";
import {
  MasonryPhotoAlbum,
  RenderImageContext,
  RenderImageProps,
  RenderPhotoContext,
} from "react-photo-album";
import "react-photo-album/masonry.css";
import { useEffect, useState, useMemo, useCallback } from "react";
import { LIST_LIMIT, MD_BREAKPOINT } from "@/app/libs/constants";
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

function renderNextImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height, index = 0 }: RenderImageContext
) {
  // Use priority loading for the first 4 images (eagerly loaded)
  // This provides fast initial rendering for visible content
  const shouldPrioritize = index < 4;

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <Image
        fill
        src={photo}
        alt={alt}
        title={title}
        sizes={sizes}
        loading={shouldPrioritize ? "eager" : "lazy"}
        priority={shouldPrioritize}
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
        data-index={index} // Add index as data attribute for debugging
      />
    </div>
  );
}

export default function PhotoGallaryTwo({}) {
  const [imageIndex, setImageIndex] = useState(-1);
  const [columns, setColumns] = useState<number | null>(null);

  const { userId } = useUser();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const a = searchParams.get("a");

  // Move postId calculation into a useMemo to maintain consistent hook ordering
  const postId = useMemo(() => (id ? parseInt(id as string) : null), [id]);
  const { data: post } = usePost(postId);

  const {
    isLoading,
    isError,
    error,
    data,
    isFetchingNextPage,
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
        result = await getOtherIsDraftPostsByUser(
          supabase,
          pageParam,
          Number(postId),
          post?.author
        );
      } else {
        result = await getOtherPostsByUser(
          supabase,
          pageParam,
          Number(postId),
          post?.author
        );
      }

      return {
        data: result ?? [],
        nextCursor: result.length === LIST_LIMIT ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data || !Array.isArray(lastPage.data)) {
        return undefined;
      }
      return lastPage.data.length < 10 ? undefined : lastPage.nextCursor;
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setColumns(window.innerWidth < MD_BREAKPOINT ? 2 : 4);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleImageIndex = useCallback((context: RenderPhotoContext) => {
    setImageIndex(context.index);
  }, []);

  if (isError) {
    return (
      <p className="wrapper">{"message" in error ? error.message : error}</p>
    );
  }

  if (!data || data.pages.length === 0 || data.pages[0].data.length === 0) {
    return <p className="text-center">No Data found.</p>;
  }

  if (!columns) return null;

  return (
    <div className="w-full">
      <InfiniteScroll
        isLoadingInitial={isLoading || (!data && !error)}
        isLoadingMore={isFetchingNextPage}
        loadMore={() => hasNextPage && fetchNextPage()}
        hasNextPage={hasNextPage}
      >
        <MasonryPhotoAlbum
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
            image: renderNextImage,
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
