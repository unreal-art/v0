"use client";
import {
  MasonryPhotoAlbum,
  RenderImageContext,
  RenderImageProps,
  RenderPhotoContext,
} from "react-photo-album";
import "react-photo-album/masonry.css";
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
import { useGalleryStore } from "@/stores/galleryStore";
import OptimizedImage from "@/app/components/OptimizedImage";
import { capitalizeFirstAlpha } from "@/utils";

function renderNextImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height, index = 0 }: RenderImageContext,
) {
  // Use priority loading for the first 4 images (eagerly loaded)
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

export default function PhotoGallary({}) {
  const [imageIndex, setImageIndex] = useState(-1);
  const [columns, setColumns] = useState<number | null>(null);

  // Use Zustand store for tab state
  const { activeTab, initFromUrl } = useGalleryStore();

  // Sync with URL on initial load (for direct URL access)
  const searchParams = useSearchParams();
  useEffect(() => {
    const urlParam = searchParams.get("s");
    initFromUrl(urlParam);
  }, [searchParams, initFromUrl]);

  const {
    isLoading,
    isError,
    error,
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", activeTab.toLowerCase()],
    queryFn: async ({ pageParam = 0 }) => {
      let result: Post[] = [];
      // Use activeTab from Zustand instead of URL param
      if (activeTab === "EXPLORE") {
        result = await getPosts(supabase, pageParam);
      } else if (activeTab === "FOLLOWING") {
        result = await getFollowingPosts(supabase, pageParam);
      } else if (activeTab === "TOP") {
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
  if (!data || data.pages.length === 0 || data.pages[0].data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[200px]">
        <p className="text-center text-lg text-primary-6">No posts found</p>
        <p className="text-center text-sm text-primary-7 mt-2">
          {activeTab === "FOLLOWING"
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
                <OptimizedImage
                  className="rounded-full drop-shadow-lg"
                  src={image}
                  width={24}
                  height={24}
                  alt={`${userName}'s profile`}
                  isProfile={true}
                  trackPerformance={true}
                  imageName={`profile-${authorId}`}
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full" /> // Fallback avatar
              )}
            </div>
            <p className="font-light text-sm drop-shadow-lg">
              {capitalizeFirstAlpha(userName)}
            </p>
          </Link>
        )}
      </div>
    </PhotoOverlay>
  );
}
