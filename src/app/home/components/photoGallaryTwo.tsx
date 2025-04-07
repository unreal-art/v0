"use client";
import {
  MasonryPhotoAlbum,
  RenderImageContext,
  RenderImageProps,
  RenderPhotoContext,
} from "react-photo-album";
import "react-photo-album/masonry.css";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { LIST_LIMIT, MD_BREAKPOINT } from "@/app/libs/constants";
//import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";
import PhotoOverlay, { ExtendedRenderPhotoContext } from "./photoOverlay";

import Image from "next/image";
import dynamic from "next/dynamic";
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
import OptimizedImage from "@/app/components/OptimizedImage";
import { capitalizeFirstAlpha } from "@/utils";

// Dynamically import ImageView component to reduce initial bundle size
const ImageView = dynamic(() => import("./imageView"), {
  ssr: false,
  loading: () => null,
});

// Define renderNextImage as a regular function since it's used as a render prop
function renderNextImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height, index = 0 }: RenderImageContext,
) {
  // Use priority loading for the first images (eagerly loaded)
  // This provides fast initial rendering for visible content
  const shouldPrioritize = index < 8;

  // Extract image name for tracking
  const imageName =
    typeof photo === "object" && photo !== null && "src" in photo
      ? String(photo.src).split("/").pop()?.split("?")[0] ||
        `gallery-img-${index}`
      : `gallery-img-${index}`;

  // Responsive size hints for optimal loading
  const responsiveSizes =
    sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <OptimizedImage
        fill
        src={photo}
        alt={alt || "Gallery image"}
        title={title}
        sizes={responsiveSizes}
        loading={shouldPrioritize ? "eager" : "lazy"}
        priority={shouldPrioritize}
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
        trackPerformance={process.env.NODE_ENV === "development"}
        imageName={imageName}
      />
    </div>
  );
}

function PhotoGallaryTwo({}) {
  const [imageIndex, setImageIndex] = useState(-1);
  const [columns, setColumns] = useState<number | null>(null);

  const { userId } = useUser();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const a = searchParams.get("a");

  // Always calculate postId in the same way for consistent hook ordering
  const postId = useMemo(() => (id ? parseInt(id as string) : null), [id]);
  const { data: post } = usePost(postId);

  // Memoize query function to avoid recreating on each render
  const queryFn = useCallback(
    async ({ pageParam = 0 }) => {
      let result: Post[] = [];

      // Always call the appropriate function based on the value of 'a'
      if (a) {
        result = await getOtherIsDraftPostsByUser(
          supabase,
          pageParam,
          Number(postId),
          post?.author,
        );
      } else {
        result = await getOtherPostsByUser(
          supabase,
          pageParam,
          Number(postId),
          post?.author,
        );
      }

      return {
        data: result ?? [],
        nextCursor: result.length === LIST_LIMIT ? pageParam + 1 : undefined,
      };
    },
    [a, postId, post?.author],
  );

  // Use a stable query key that won't change structure between renders
  const queryKey = useMemo(
    () => [
      "other_posts_by_user",
      post?.author || "",
      a ? "drafts" : "public",
      postId,
    ],
    [post?.author, a, postId],
  );

  const {
    isLoading,
    isError,
    error,
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data || !Array.isArray(lastPage.data)) {
        return undefined;
      }
      return lastPage.data.length < 10 ? undefined : lastPage.nextCursor;
    },
  });

  // Optimize resize handling with useCallback to prevent recreation
  const handleResize = useCallback(() => {
    setColumns(window.innerWidth < MD_BREAKPOINT ? 2 : 4);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const handleImageIndex = useCallback((context: RenderPhotoContext) => {
    setImageIndex(context.index);
  }, []);

  // Memoize formatted photos to prevent recalculation on each render
  const photos = useMemo(
    () => formattedPhotos(data?.pages ?? []),
    [data?.pages],
  );

  // Early return after all hooks have been called
  if (isError) {
    return (
      <p className="wrapper">{"message" in error ? error.message : error}</p>
    );
  }

  if (
    !isLoading &&
    (!data || data.pages.length === 0 || data.pages[0].data.length === 0)
  ) {
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

// Memoize the PhotoWithAuthor component to prevent unnecessary rerenders
const PhotoWithAuthor = memo(function PhotoWithAuthor({
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
                <OptimizedImage
                  className="rounded-full drop-shadow-lg"
                  src={image}
                  width={24}
                  height={24}
                  alt={`${userName}'s profile picture`}
                  trackPerformance={true}
                  imageName={`profile-${authorId}`}
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full" /> // Fallback avatar
              )}
            </div>
            <p className="font-semibold text-sm drop-shadow-lg">
              {capitalizeFirstAlpha(userName)}
            </p>
          </>
        )}
      </div>
    </PhotoOverlay>
  );
});

export default memo(PhotoGallaryTwo);
