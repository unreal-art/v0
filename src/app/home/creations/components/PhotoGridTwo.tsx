"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import Image from "next/image";
import { truncateText } from "$/utils";
import { timeAgo } from "@/app/libs/timeAgo";
import { OptionMenuIcon } from "@/app/components/icons";
import { TabText } from "./Tabs";
import NoItemFound from "./NoItemFound";
import InfiniteScroll from "../../components/InfiniteScroll";
import ImageView from "../../components/imageView";
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
  id: number;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  prompt?: string;
  createdAt: string;
  author: string;
}

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

  // Memoize photos array to prevent unnecessary recalculations
  const photos = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages
      .flatMap((page: any) => page.data || [])
      .map((post: PhotoData) => {
        const image = post.ipfsImages?.[0];
        if (!image?.hash || !image?.fileNames?.[0]) return null;

        const imageUrl =
          process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY +
          image.hash +
          "/" +
          image.fileNames[0];

        return {
          id: post.id,
          src: imageUrl,
          width: size.width,
          height: size.height,
          alt: post.caption || post.prompt || "",
          caption: post.caption,
          prompt: post.prompt,
          createdAt: post.createdAt,
          author: post.author,
        } as TransformedPhoto;
      })
      .filter(Boolean);
  }, [data?.pages, size]);

  // Window resize handler with debouncing
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

  // Memoized handlers
  const handleImageIndex = useCallback(
    (context: ExtendedRenderPhotoContext) => {
      setImageIndex(context.index);
    },
    []
  );

  // Loading skeleton component
  const LoadingSkeleton = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center max-w-[1536px]">
        {Array(12)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              style={{ width: size.width, height: size.height }}
              className="relative grid-cols-1"
            >
              <Skeleton
                height="100%"
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
            </div>
          ))}
      </div>
    ),
    [size]
  );

  // Show initial loading state
  if (isLoading) return LoadingSkeleton;

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
        loadMore={() => hasNextPage && fetchNextPage()}
        hasNextPage={hasNextPage}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center max-w-[1536px]">
          {photos.map((photo: any, index: number) => {
            const context = {
              index,
              photo,
              width: photo.width,
              height: photo.height,
            };

            return (
              <div
                key={index}
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
                    />

                    <p className="absolute bottom-0 left-0 w-full text-left text-primary-1 text-sm picture-gradient h-14 p-3">
                      {truncateText(
                        context.photo.caption || context.photo.prompt
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center">
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={`loading-${index}`}
                    style={{ width: size.width, height: size.height }}
                    className="relative"
                  >
                    <Skeleton
                      height="100%"
                      baseColor="#1a1a1a"
                      highlightColor="#333"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </InfiniteScroll>

      {imageIndex > -1 && (
        <ImageView photo={photos[imageIndex]} setImageIndex={setImageIndex} />
      )}
    </>
  );
}
