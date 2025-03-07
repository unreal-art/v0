"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import Image from "next/image";
import { truncateText } from "@/utils";
import { timeAgo } from "@/app/libs/timeAgo";
import { OptionMenuIcon } from "@/app/components/icons";
import { TabText } from "./Tabs";
import NoItemFound from "./NoItemFound";
import InfiniteScroll from "../../components/InfiniteScroll";
import dynamic from "next/dynamic";
import PhotoOverlay, {
  ExtendedRenderPhotoContext,
} from "../../components/photoOverlay";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Constants for breakpoints and grid sizing
const BREAKPOINTS = {
  TWO_XL: 1536,
  LG: 1024,
  MD: 768,
} as const;

const GRID_SIZES = {
  TWO_XL: { width: 380, height: 380 },
  LG: { width: 320, height: 320 },
  MD: { width: 320, height: 320 },
  SM: { width: 300, height: 300 },
} as const;

type GridSize = (typeof GRID_SIZES)[keyof typeof GRID_SIZES];

// Props interface for the PhotoGridTwo component
interface TabProps {
  title: TabText;
  content: string;
  subContent: string;
  data?: any;
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

interface PhotoData {
  id: number;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  prompt?: string;
  createdAt: string;
  ipfsImages?: Array<{
    hash: string;
    fileNames: string[];
  }>;
  author: string;
}

interface TransformedPhoto {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  prompt: string;
  createdAt: string;
  author: string;
}

// Dynamically import ImageView with no SSR since it's only needed on client
const ImageView = dynamic(() => import("../../components/imageView"), {
  ssr: false,
  loading: () => null,
});

export default function PhotoGridTwo({
  title,
  content,
  subContent,
  data,
  isLoading = false,
  hasNextPage = false,
  fetchNextPage = () => {},
  isFetchingNextPage = false,
}: TabProps): ReactElement {
  // State management
  const [imageIndex, setImageIndex] = useState(-1);
  const [size, setSize] = useState<GridSize>(GRID_SIZES.LG);

  // Memoized values and callbacks
  const photos = useMemo(() => {
    if (!data?.pages) return [];
    const transformedPhotos = new Map();

    return data.pages
      .flatMap((page: any) => page.data || [])
      .reduce((acc: TransformedPhoto[], post: PhotoData) => {
        if (transformedPhotos.has(post.id)) {
          return acc;
        }

        const image = post.ipfsImages?.[0];
        if (!image?.hash || !image?.fileNames?.[0]) return acc;

        const imageUrl = `${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${image.hash}/${image.fileNames[0]}`;

        const transformedPhoto = {
          id: post.id.toString(),
          src: imageUrl,
          width: size.width,
          height: size.height,
          alt: post.caption || post.prompt || "",
          caption: post.caption,
          prompt: post.prompt || "",
          createdAt: post.createdAt,
          author: post.author,
        } as TransformedPhoto;

        transformedPhotos.set(post.id, true);
        acc.push(transformedPhoto);
        return acc;
      }, []);
  }, [data?.pages, size]);

  const handleImageIndex = useCallback(
    (context: ExtendedRenderPhotoContext) => {
      setImageIndex(context.index);
    },
    [],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  // Memoized loading skeleton
  const loadingSkeleton = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center max-w-[1536px]">
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
    ),
    [size],
  );

  // Memoized loading more skeleton
  const loadingMoreSkeleton = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center">
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
    ),
    [size],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        if (width >= BREAKPOINTS.TWO_XL) {
          setSize(GRID_SIZES.TWO_XL);
        } else if (width >= BREAKPOINTS.LG) {
          setSize(GRID_SIZES.LG);
        } else if (width >= BREAKPOINTS.MD) {
          setSize(GRID_SIZES.MD);
        } else {
          setSize(GRID_SIZES.SM);
        }
      }, 100);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Show initial loading state
  if (isLoading) return loadingSkeleton;

  // Show empty state
  if (!data?.pages || !photos.length) {
    return (
      <NoItemFound title={title} content={content} subContent={subContent} />
    );
  }

  return (
    <>
      <InfiniteScroll
        isLoadingInitial={false}
        isLoadingMore={isFetchingNextPage}
        loadMore={loadMore}
        hasNextPage={hasNextPage}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center max-w-[1536px]">
          {photos.map((photo: TransformedPhoto, index: number) => {
            const context = {
              index,
              photo,
              width: photo.width,
              height: photo.height,
            };

            return (
              <div
                key={photo.id}
                style={{ width: size.width, height: size.height }}
                className="relative grid-cols-1"
              >
                <PhotoOverlay
                  setImageIndex={() =>
                    handleImageIndex(context as ExtendedRenderPhotoContext)
                  }
                  context={context as ExtendedRenderPhotoContext}
                  photo={
                    <Image
                      src={photo.src}
                      width={500}
                      height={500}
                      alt={String(photo.alt)}
                      priority={index < 4}
                      className="object-cover"
                      loading={index < 8 ? "eager" : "lazy"}
                      sizes="(min-width: 1536px) 380px, (min-width: 1024px) 320px, (min-width: 768px) 320px, 300px"
                    />
                  }
                >
                  <>
                    <div className="absolute top-0 flex justify-between text-primary-1 text-sm picture-gradient w-full h-12 items-center px-3">
                      <p>{timeAgo(context.photo.createdAt)}</p>
                      <button>
                        <OptionMenuIcon color="#FFFFFF" />
                      </button>
                    </div>

                    <Image
                      src={photo.src}
                      width={500}
                      height={500}
                      alt={String(photo.alt)}
                      priority={index < 4}
                      className="object-cover"
                      loading={index < 8 ? "eager" : "lazy"}
                      sizes="(min-width: 1536px) 380px, (min-width: 1024px) 320px, (min-width: 768px) 320px, 300px"
                    />

                    <p className="absolute bottom-0 left-0 w-full text-left text-primary-1 text-sm picture-gradient h-14 p-3">
                      {truncateText(
                        context.photo.caption || context.photo.prompt,
                      )}
                    </p>
                  </>
                </PhotoOverlay>
              </div>
            );
          })}
        </div>

        {isFetchingNextPage && (
          <div className="w-full py-4 flex justify-center">
            {loadingMoreSkeleton}
          </div>
        )}
      </InfiniteScroll>

      {imageIndex > -1 && (
        <ImageView photo={photos[imageIndex]} setImageIndex={setImageIndex} />
      )}
    </>
  );
}
