"use client";
import { ColumnsPhotoAlbum } from "react-photo-album";
import "react-photo-album/columns.css";
import { useEffect, useState } from "react";
import { MD_BREAKPOINT } from "@/app/libs/constants";
import dummyPhotos from "../dummyPhotos";
//import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";
import PhotoOverlay from "./photoOverlay";
// import { getPosts } from "$/queries/post/getPosts";
// import { supabase } from "$/supabase/client";
import { usePostsQuery } from "@/hooks/usePostsQuery";
// import { useQuery } from "@tanstack/react-query";

export default function PhotoGallary() {
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

  return (
    <ColumnsPhotoAlbum
      photos={dummyPhotos}
      columns={columns}
      spacing={1}
      render={{
        extras: () => <PhotoOverlay />,
      }}
      onClick={(photo) => {
        console.log({ photo });
      }}
    />
  );
}
