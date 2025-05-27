"use client";
import {
  MasonryPhotoAlbum,
  RenderImageContext,
  RenderImageProps,
  RenderPhotoContext,
} from "react-photo-album";
import "react-photo-album/masonry.css";
import { useEffect, useState } from "react";
import { MD_BREAKPOINT } from "@/app/libs/constants";
import PhotoOverlay, { ExtendedRenderPhotoContext } from "../photoOverlay";
import ImageView from "../imageView";
import InfiniteScroll from "../InfiniteScroll";
import { formattedPhotosForGallery } from "../../formattedPhotos";
import { useSearchParams } from "next/navigation";
import useAuthorUsername from "@/hooks/useAuthorUserName";
import useAuthorImage from "@/hooks/useAuthorImage";
import { useSearchPostsInfinite } from "@/hooks/useSearchPostsInfinite";
import { useGalleryStore } from "@/stores/galleryStore";
import OptimizedImage from "@/app/components/OptimizedImage";
import { capitalizeFirstAlpha } from "@/utils";

// Add renderNextImage function for lazy/eager loading
function renderNextImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height, index = 0 }: RenderImageContext,
) {
  // Use priority loading for the first 8 images (eagerly loaded)
  // This provides fast initial rendering for visible content
  const shouldPrioritize = index < 8;

  // Extract image name for tracking
  const imageName =
    typeof photo === "object" && photo !== null && "src" in photo
      ? String(photo.src).split("/").pop()?.split("?")[0] ||
        `search-img-${index}`
      : `search-img-${index}`;

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
        alt={alt || "Search result"}
        title={title}
        sizes={responsiveSizes}
        className="rounded-lg"
        loading={shouldPrioritize ? "eager" : "lazy"}
        priority={shouldPrioritize}
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
        trackPerformance={process.env.NODE_ENV === "development"}
        imageName={imageName}
      />
    </div>
  );
}

export default function SearchPhotoGallary({
  searchTerm,
}: {
  searchTerm: string;
}) {
  const [imageIndex, setImageIndex] = useState(-1);
  const [columns, setColumns] = useState<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // Use Zustand store for tab state
  const { initFromUrl } = useGalleryStore();

  // Sync with URL on initial load
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);

    // Check if the function exists before calling it
    if (initFromUrl && searchParams) {
      const urlParam = searchParams.get("s");
      initFromUrl(urlParam);
    }
  }, [searchParams, initFromUrl]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchPostsInfinite(searchTerm, 10);

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure it runs only on the client

    const handleResize = () => {
      setColumns(window.innerWidth < MD_BREAKPOINT ? 2 : 4);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call initially to set correct columns

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleImageIndex = (context: RenderPhotoContext) => {
    setImageIndex(context.index);
  };

  // If still server-side or columns haven't been calculated, show a loading placeholder
  if (!isClient || columns === undefined) {
    return (
      <div className="flex items-center justify-center h-48">
        <p>Loading gallery...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="wrapper">
        {error && typeof error === "object" && "message" in error
          ? error.message
          : "An error occurred while loading search results"}
      </p>
    );
  }

  // Check if we have no data to display
  if (!data || data.pages.length === 0 || data.pages[0].data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-8">
        <p className="text-center text-lg">
          No results found for "{searchTerm}"
        </p>
        <p className="text-center text-sm mt-2 text-gray-500">
          Try different keywords or check your spelling
        </p>
      </div>
    );
  }

  // Format photos safely
  const photos = formattedPhotosForGallery(data?.pages ?? []);

  return (
    <div className="w-full">
      <InfiniteScroll
        isLoadingInitial={isLoading}
        isLoadingMore={isFetchingNextPage}
        loadMore={() => hasNextPage && fetchNextPage()}
        hasNextPage={!!hasNextPage}
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
      {imageIndex > -1 && photos[imageIndex] && (
        <ImageView photo={photos[imageIndex]} setImageIndex={setImageIndex} />
      )}
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
  // Safeguard against undefined context.photo
  if (!context || !context.photo) {
    return null;
  }

  const authorId = context.photo.author || ""; // Ensure it's always a string

  const { data: userName, isLoading: isUserLoading } =
    useAuthorUsername(authorId);
  const { data: image, isLoading: imageLoading } = useAuthorImage(authorId);

  return (
    <PhotoOverlay
      setImageIndex={() => handleImageIndex(context)}
      context={context}
    >
      <div className="absolute flex items-center gap-1 bottom-2 left-2">
        {!isUserLoading && !imageLoading && userName && (
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
                  isProfile={true}
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full" /> // Fallback avatar
              )}
            </div>
            <p className="font-semibold text-sm drop-shadow-lg">
              {typeof capitalizeFirstAlpha === "function"
                ? capitalizeFirstAlpha(userName)
                : userName}
            </p>
          </>
        )}
      </div>
    </PhotoOverlay>
  );
}
