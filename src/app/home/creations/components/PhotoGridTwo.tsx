"use client";
import { ColumnsPhotoAlbum, RenderPhotoContext } from "react-photo-album";
import "react-photo-album/columns.css";
import { useEffect, useState } from "react";
import { LIST_LIMIT, MD_BREAKPOINT } from "@/app/libs/constants";
//import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";
import PhotoOverlay, {
  ExtendedRenderPhotoContext,
} from "../../components/photoOverlay";
// import { getPosts } from "$/queries/post/getPosts";
// import { supabase } from "$/supabase/client";
import ImageView from "../../components/imageView";
import { OptionMenuIcon } from "@/app/components/icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getIsDraftPostsByUser,
  getPinnedPostsByUser,
  getPostsByUser,
  getPrivatePostsByUser,
  getUserLikedPosts,
} from "@/queries/post/getPostsByUser";
import { formattedPhotos, formattedPhotosForGrid } from "../../formattedPhotos";
import { supabase } from "$/supabase/client";
import InfiniteScroll from "../../components/InfiniteScroll";
import NoItemFound from "./NoItemFound";
import { TabText } from "./Tabs";
import { truncateText } from "$/utils";
import { useSearchParams } from "next/navigation";
import { Post } from "$/types/data.types";
import { timeAgo } from "@/app/libs/timeAgo";
import Image from "next/image";
// import { useQuery } from "@tanstack/react-query";

interface TabProps {
  title: TabText;
  content: string;
  subContent: string;
}

const TWO_XL_BREAK_POINT = 1536;
const LG_BREAKPOINT = 1024;

export default function PhotoGridTwo({ title, content, subContent }: TabProps) {
  const [imageIndex, setImageIndex] = useState(-1);
  const [size, setSize] = useState({ width: 350, height: 350 });

  const searchParams = useSearchParams();
  const s = searchParams.get("s");

  // const { data: posts } = useQuery({
  //   queryKey: ["posts"],
  //   queryFn: () => getPosts(supabase),
  // });

  const {
    isLoading,
    data,
    isFetchingNextPage,
    //isFetching,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["creation_posts", s || "public"],
    queryFn: async ({ pageParam = 0 }) => {
      let result: Post[] = [];
      if (s?.toUpperCase() === "PUBLIC") {
        result = await getPostsByUser(supabase, pageParam);
      } else if (s?.toUpperCase() === "PRIVATE") {
        result = await getPrivatePostsByUser(supabase, pageParam);
      } else if (s?.toUpperCase() === "LIKED") {
        result = await getUserLikedPosts(supabase, pageParam);
      } else if (s?.toUpperCase() === "PINNED") {
        result = await getPinnedPostsByUser(supabase, pageParam);
      } else if (s?.toUpperCase() === "DRAFT") {
        result = await getIsDraftPostsByUser(supabase, pageParam);
      } else {
        result = await getPostsByUser(supabase, pageParam);
      }

      return {
        data: result ?? [],
        nextCursor: result.length === LIST_LIMIT ? pageParam + 1 : undefined, // ✅ Ensure cursor is only set if limit is reached
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
    if (typeof window === "undefined") return;

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    const width = window.innerWidth;
    //const height = window.innerHeight
    if (width >= TWO_XL_BREAK_POINT) {
      setSize({ width: 380, height: 380 });
    } else if (width >= LG_BREAKPOINT) {
      setSize({ width: 320, height: 320 });
    } else if (width <= MD_BREAKPOINT) {
      setSize({ width: 320, height: 320 });
    } else if (width < MD_BREAKPOINT) {
      setSize({ width: 300, height: 300 });
    }
  };

  const handleImageIndex = (context: RenderPhotoContext) => {
    setImageIndex(context.index);
  };

  if (!data || data.pages.length === 0 || data.pages[0].data.length === 0) {
    return <p className="text-center">No Data found.</p>;
  }

  const photos = formattedPhotosForGrid(data?.pages ?? []);

  return (
    <>
      <InfiniteScroll
        isLoadingInitial={isLoading || (!data && !error)} // during initial load or no data
        isLoadingMore={isFetchingNextPage}
        loadMore={() => hasNextPage && fetchNextPage()}
        hasNextPage={hasNextPage}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 place-items-center max-w-[1536px]">
          {photos.map((photo, index) => {
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
                  setImageIndex={() => handleImageIndex(context)}
                  context={context as ExtendedRenderPhotoContext}
                  photo={
                    <Image
                      src={photo.src}
                      width={500}
                      height={500}
                      alt={String(photo.alt)}
                      priority
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
                      priority
                      alt={String(photo.alt)}
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

      {photos.length < 1 && (
        <NoItemFound title={title} content={content} subContent={subContent} />
      )}

      <ImageView
        photo={imageIndex > -1 && photos[imageIndex]}
        setImageIndex={setImageIndex}
      />
    </>
  );
}
