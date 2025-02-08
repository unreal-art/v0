"use client"
import { ColumnsPhotoAlbum, RenderImageContext, RenderImageProps } from "react-photo-album";
import "react-photo-album/columns.css";
import { useEffect, useState } from "react";
import photos from "../photos";
import Image from "next/image";
import { MD_BREAKPOINT } from "@/app/libs/constants";


export default function PhotoGallary() {
    const [columns, setColumns] = useState(window?.innerWidth < MD_BREAKPOINT ? 2 : 4)

    useEffect(() => {
        window.addEventListener("resize", () => {
        if (window.innerWidth < MD_BREAKPOINT) {
            setColumns(2)
        } else {
            setColumns(4)
        }
        })
        return () => window.removeEventListener("resize", () => console.log("removed"))
    }, [])

    return (
        <ColumnsPhotoAlbum //render={{ image: renderNextImage }} 
            photos={photos} 
            columns={columns}
            onClick={(photo) => {
                console.log({photo})
            }}
        />
    );
}



export function renderNextImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext,
) {
  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <Image
        fill
        src={photo}
        alt={alt}
        title={title}
        sizes={sizes}
        placeholder={"blurDataURL" in photo ? "blur" : undefined} />
    </div>
  );
}