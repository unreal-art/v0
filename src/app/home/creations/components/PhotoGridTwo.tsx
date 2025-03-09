"use client";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import type { ReactElement } from "react";
import Image from "next/image";
import { truncateText } from "@/utils";
import { timeAgo } from "@/app/libs/timeAgo";
import { OptionMenuIcon } from "@/app/components/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NoItemFound from "./NoItemFound";
import InfiniteScroll from "../../components/InfiniteScroll";
import dynamic from "next/dynamic";
import PhotoOverlay, {
  ExtendedRenderPhotoContext,
} from "../../components/photoOverlay";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { TabText } from "@/stores/creationAndProfileStore";
import { Post } from "$/types/data.types";

// Constants for breakpoints and grid sizing
const BREAKPOINTS = {
  FOUR_XL: 2000,
  TWO_XL: 1536,
  XL: 1280,
  LG: 1024,
  MD: 768,
  SM: 640,
} as const;

const GRID_SIZES = {
  TWO_XL: 380,
  LG: 320,
  MD: 320,
  SM: 300,
} as const;

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
  caption?: string | null;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<TransformedPhoto[]>([]);
  const [transformedPosts, setTransformedPosts] = useState<TransformedPhoto[]>(
    [],
  );
  const [stableLoading, setStableLoading] = useState(true); // Stable loading state to prevent flashing
  const [imageIndex, setImageIndex] = useState(-1);
  const [size, setSize] = useState<number>(GRID_SIZES.LG);

  // Transform and stabilize data updates to prevent flashing
  useEffect(() => {
    // During transitions, we keep the previous data and just overlay loading indicators
    // Only reset data when we have a real loading state (not a transition)
    if (isLoading && !photos.length) {
      setStableLoading(true);
    }

    // If we have data, process it
    if (data?.pages) {
      const allPosts = data.pages.flatMap((page: any) => page.data || []);

      // Transform the posts into photo format
      const newTransformedPosts = allPosts
        .filter((post: Post) => {
          const image = post.ipfsImages?.[0];
          return image?.hash && image?.fileNames?.[0];
        })
        .map((post: Post): TransformedPhoto => {
          const image = post.ipfsImages?.[0];
          // We already filtered out null cases above
          const imageUrl = `${
            process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY || ""
          }${image!.hash}/${image!.fileNames[0]}`;

          return {
            id: post.id.toString(),
            src: imageUrl,
            width: size,
            height: size,
            alt: post.caption || post.prompt || "",
            caption: post.caption,
            prompt: post.prompt || "",
            createdAt: post.createdAt,
            author: post.author,
          };
        });

      setTransformedPosts(newTransformedPosts);

      // Turn off loading only when we have posts or we're sure we're done loading
      if (newTransformedPosts.length > 0 || !isLoading) {
        setStableLoading(false);
        setPhotos(newTransformedPosts);
      }
    } else if (!isLoading && data) {
      // Only turn off loading and show empty state when we're completely done loading
      // AND we have a data object (even if it has no items)
      setStableLoading(false);
      setPhotos([]);
    }
  }, [data, isLoading, size]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = Number(window.innerWidth);
        if (width >= BREAKPOINTS.FOUR_XL) {
          setSize(width * 0.22);
        } else if (width >= BREAKPOINTS.TWO_XL) {
          setSize(width * 0.21);
        } else if (width >= BREAKPOINTS.XL) {
          setSize(width * 0.276);
        } else if (width >= BREAKPOINTS.LG) {
          setSize(width * 0.266);
        } else if (width >= BREAKPOINTS.MD) {
          setSize(width * 0.41);
        } else if (width >= BREAKPOINTS.SM) {
          setSize(width * 0.49);
        } else {
          setSize(width * 0.98);
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

  // Only show empty state when we're not loading and have no photos
  // We've already confirmed we have data object but it's empty
  if (!photos.length && !isLoading && !stableLoading && data) {
    return (
      <NoItemFound title={title} content={content} subContent={subContent} />
    );
  }

  // Now let InfiniteScroll handle the loading states
  return (
    <>
      <InfiniteScroll
        isLoadingInitial={isLoading || stableLoading}
        isLoadingMore={isFetchingNextPage}
        loadMore={loadMore}
        hasNextPage={hasNextPage}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center">
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
                style={{ width: size, height: size }}
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
                      fill={true}
                      alt={String(photo.alt)}
                      priority={index < 4}
                      className="object-cover"
                      loading={index < 8 ? "eager" : "lazy"}
                      sizes="(min-width: 1536px) 380px, (min-width: 1024px) 320px, (min-width: 768px) 320px, 300px"
                    />
                  }
                  section="photoGridTwo"
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
                      fill={true}
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
      </InfiniteScroll>

      {imageIndex > -1 && (
        <ImageView photo={photos[imageIndex]} setImageIndex={setImageIndex} />
      )}
    </>
  );
}
