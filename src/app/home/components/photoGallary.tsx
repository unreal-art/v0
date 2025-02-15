"use client";
import { ColumnsPhotoAlbum, Photo, RenderPhotoContext } from "react-photo-album";
import "react-photo-album/columns.css";
import { useEffect, useState } from "react";
import { MD_BREAKPOINT } from "@/app/libs/constants";
// import dummyPhotos from "../dummyPhotos";
//import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";
import PhotoOverlay from "./photoOverlay";
// import { getPosts } from "$/queries/post/getPosts";
// import { supabase } from "$/supabase/client";
import { usePostsQuery } from "@/hooks/usePostsQuery";
import Image from "next/image";
import ImageView from "./imageView";
// import { usePostsQuery } from "@/hooks/usePostsQuery";
import { supabase } from "$/supabase/client";
import { getPosts } from "$/queries/post/getPosts";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "./InfiniteScroll";
import { formattedPhotos } from "../formattedPhotos";
// import { useQuery } from "@tanstack/react-query";
//

export default function PhotoGallary({}) {
  const [imageIndex, setImageIndex] = useState(-1)
  const [columns, setColumns] = useState(
    window?.innerWidth < MD_BREAKPOINT ? 2 : 4,
  );

  // const { data: posts } = useQuery({
  //   queryKey: ["posts"],
  //   queryFn: () => getPosts(supabase),
  // });
  const {
    isLoading,
    isError,
    error,
    data,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getPosts(supabase, pageParam);

      return {
        data: result ?? [],
        nextCursor: result.length > 0 ? pageParam + 1 : undefined, // ✅ Stop pagination if no data
      };
    },
    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      if (!lastPage?.data || !Array.isArray(lastPage.data)) {
        return undefined;
      }

      if (lastPage.data.length === 0) {
        return undefined;
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
    setImageIndex(context.index)
  }

  // if (isLoading || isFetching) {
  //   return <p>Loading ... </p>;
  // }

  if (isError) {
    return (
      <p className="wrapper">{"message" in error ? error.message : error}</p>
    );
  }

  if (!data || data.pages.length === 0) {
    return (
      <p>It looks like you haven&apos;t saved any books to this shelf yet.</p>
    );
  }

  return (
    <>
      <InfiniteScroll
        isLoadingIntial={isLoading || isFetching}
        isLoadingMore={isFetchingNextPage}
        loadMore={() => hasNextPage && fetchNextPage()}
      >
        <ColumnsPhotoAlbum
          photos={formattedPhotos(data?.pages ?? [])}
          columns={columns}
          spacing={1}
          render={{
            extras: (_, context) => (
            <PhotoOverlay setImageIndex={() => handleImageIndex(context)}> 
              <div className="absolute flex items-center gap-1 bottom-2 left-2">
                <div className="rounded-full">
                  <Image className="rounded-full border-[1px] border-primary-3 drop-shadow-lg" src={"/icons/dummy-profile.png"} width={24} height={24} alt="profile" />
                </div>
                <p className="font-semibold text-sm drop-shadow-lg">David</p>
              </div>
            </PhotoOverlay>
            ),
          }}
        />
      </InfiniteScroll>
      <ImageView photo={imageIndex > -1 && formattedPhotos(data?.pages ?? [])[imageIndex]} setImageIndex={setImageIndex} />
    </>
  );
}
