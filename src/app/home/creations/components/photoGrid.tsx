"use client";
//@deprecated
import { useState } from "react";
import Image from "next/image";
import { OptionMenuIcon } from "@/app/components/icons";
// import PhotoOverlay from "../../components/photoOverlay";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostsByUser } from "@/queries/post/getPostsByUser";
import { supabase } from "$/supabase/client";
import InfiniteScroll from "../../components/InfiniteScroll";
import { formattedPhotos } from "../../formattedPhotos";
import { truncateText } from "$/utils";

const PhotoGrid = () => {
  const [hover, setHover] = useState(false);
  const {
    isLoading,
    data,
    isFetchingNextPage,
    //isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["creation_posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getPostsByUser(supabase, pageParam);

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

  return (
    <InfiniteScroll
      isLoadingInitial={isLoading}
      isLoadingMore={isFetchingNextPage}
      loadMore={() => hasNextPage && fetchNextPage()}
    >
      <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-4">
        {formattedPhotos(data?.pages ?? []).map((photo, index) => {
          return (
            <div
              key={index}
              className="relative text-primary-1 text-sm"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              {hover && (
                <div className="picture-gradient absolute top-0 left-0 h-12 w-full flex justify-between items-center px-3">
                  <p>36s</p>
                  <button>
                    <OptionMenuIcon color="#FFFFFF" />
                  </button>
                </div>
              )}
              <Image src={photo.src} width={600} height={600} alt="Photo" />
              {hover && (
                <div className="picture-gradient absolute bottom-0 left-0 h-16 w-full p-3">
                  <p>{truncateText(photo.prompt)}</p>
                </div>
              )}
              {/* <PhotoOverlay /> */}
            </div>
          );
        })}
      </div>
    </InfiniteScroll>
  );
};

export default PhotoGrid;
