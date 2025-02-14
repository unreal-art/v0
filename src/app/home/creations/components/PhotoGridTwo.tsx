"use client";
import { ColumnsPhotoAlbum, RenderPhotoContext } from "react-photo-album";
import "react-photo-album/columns.css";
import { useEffect, useState } from "react";
import { MD_BREAKPOINT } from "@/app/libs/constants";
import dummyPhotos, { dummyPhotos2 } from "../../dummyPhotos";
//import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";
import PhotoOverlay from "../../components/photoOverlay";
// import { getPosts } from "$/queries/post/getPosts";
// import { supabase } from "$/supabase/client";
import { usePostsQuery } from "@/hooks/usePostsQuery";
import Image from "next/image";
import ImageView from "../../components/imageView";
import { OptionMenuIcon } from "@/app/components/icons";
import { PhotoGridProps } from "../../components/photoGallary";
// import { useQuery } from "@tanstack/react-query";


export default function PhotoGridTwo({ data } : PhotoGridProps) {
  const [imageIndex, setImageIndex] = useState(-1)
  const [columns, setColumns] = useState(
    window?.innerWidth < MD_BREAKPOINT ? 2 : 4,
  );

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);

  // const { data: posts } = useQuery({
  //   queryKey: ["posts"],
  //   queryFn: () => getPosts(supabase),
  // });

  const { data: posts, isFetching } = usePostsQuery(start, end);

  console.log("client:", posts, isFetching);

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

  console.log(imageIndex > -1 && data[imageIndex])

  return (
    <>
      <ColumnsPhotoAlbum
        photos={data}
        columns={columns}
        spacing={2}
        render={{
          extras: (_, context) => (
          <PhotoOverlay setImageIndex={() => handleImageIndex(context)}> 
            <>
         
              <div className="absolute top-0 flex justify-between text-primary-1 text-sm picture-gradient w-full h-12 items-center px-3">
                <p>36s</p> 
                <button>
                  <OptionMenuIcon color="#FFFFFF" />
                </button>
              </div>

              <p className="absolute bottom-0 left-0 text-left text-primary-1 text-sm picture-gradient h-14 p-3">
                Pixar Fest at Disneyland sounds amazing! I need to see the new parades! 🎉🎈
              </p>
                
            </>
          </PhotoOverlay>
          ),
        }}
      />
      <ImageView photo={imageIndex > -1 && data[imageIndex]} setImageIndex={setImageIndex} />
    </>
  );
}
