"use client";
import { ColumnsPhotoAlbum } from "react-photo-album";
import "react-photo-album/columns.css";
import { useEffect, useState } from "react";
import { MD_BREAKPOINT } from "@/app/libs/constants";
import dummyPhotos from "../dummyPhotos";
//import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";
import PhotoOverlay from "./photoOverlay";

export default function PhotoGallary() {
  const [columns, setColumns] = useState(
    window?.innerWidth < MD_BREAKPOINT ? 2 : 4,
  );

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < MD_BREAKPOINT) {
        setColumns(2);
      } else {
        setColumns(4);
      }
    });
    return () =>
      window.removeEventListener("resize", () => console.log("removed"));
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
