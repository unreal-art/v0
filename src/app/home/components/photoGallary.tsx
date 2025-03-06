"use client";
import {
  ColumnsPhotoAlbum,
  RenderImageContext,
  RenderImageProps,
  RenderPhotoContext,
} from "react-photo-album";
import "react-photo-album/columns.css";
import { useEffect, useState } from "react";
import { LIST_LIMIT, MD_BREAKPOINT } from "@/app/libs/constants";
//import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";
import PhotoOverlay, { ExtendedRenderPhotoContext } from "./photoOverlay";

import Image from "next/image";
import ImageView from "./imageView";
// import { usePostsQuery } from "@/hooks/usePostsQuery";
import { supabase } from "$/supabase/client";
import {
  getFollowingPosts,
  getPosts,
  getTopPosts,
} from "@/queries/post/getPosts";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "./InfiniteScroll";
import { formattedPhotos, formattedPhotosForGallary } from "../formattedPhotos";
import { Post } from "$/types/data.types";
import { useSearchParams } from "next/navigation";
// import { getAuthorUserName } from "@/queries/post/getAuthorUserName";
import useAuthorUsername from "@/hooks/useAuthorUserName";
import useAuthorImage from "@/hooks/useAuthorImage";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";

function renderNextImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext
) {
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
        priority
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
      />
    </div>
  );
}

export default function PhotoGallary({}) {
  const [imageIndex, setImageIndex] = useState(-1);
  const [columns, setColumns] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const s = searchParams.get("s");

  const {
    isLoading,
    isError,
    error,
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", s || "explore"],
    queryFn: async ({ pageParam = 0 }) => {
      let result: Post[] = [];
      if (s?.toUpperCase() === "EXPLORE") {
        result = await getPosts(supabase, pageParam);
      } else if (s?.toUpperCase() === "FOLLOWING") {
        result = await getFollowingPosts(supabase, pageParam);
      } else if (s?.toUpperCase() === "TOP") {
        result = await getTopPosts(supabase, pageParam);
      } else {
        result = await getPosts(supabase, pageParam);
      }

      return {
        data: result ?? [],
        nextCursor: result.length === LIST_LIMIT ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      requestAnimationFrame(() => {
        setColumns(window.innerWidth < MD_BREAKPOINT ? 2 : 4);
      });
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.body);

    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleImageIndex = (context: RenderPhotoContext) => {
    setImageIndex(context.index);
  };

  if (isError) {
    return (
      <p className="wrapper">{"message" in error ? error.message : error}</p>
    );
  }

  // Show loading state during initial data fetch
  if (isLoading || !columns) {
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

  // Only show no data message when we have data object but it's empty
  if (data && data.pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[200px]">
        <p className="text-center text-lg text-primary-6">No posts found</p>
        <p className="text-center text-sm text-primary-7 mt-2">
          {s?.toUpperCase() === "FOLLOWING"
            ? "Follow some creators to see their posts here"
            : "Be the first to share something amazing"}
        </p>
      </div>
    );
  }

  const photos = formattedPhotosForGallary(data?.pages ?? []);

  return (
    <div className="w-full">
      <InfiniteScroll
        isLoadingInitial={isLoading}
        isLoadingMore={isFetchingNextPage}
        loadMore={() => hasNextPage && fetchNextPage()}
        hasNextPage={hasNextPage}
      >
        <ColumnsPhotoAlbum
          photos={photos}
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
        photo={imageIndex > -1 && photos[imageIndex]}
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
          <Link
            href={`/home/profile/${authorId}`}
            className="flex items-center gap-2"
          >
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
          </Link>
        )}
      </div>
    </PhotoOverlay>
  );
}
