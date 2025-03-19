"use client";
import { IPhoto } from "@/app/libs/interfaces";
import Image from "next/image";
import { ExtendedPhoto } from "../formattedPhotos";
import useAuthorUsername from "@/hooks/useAuthorUserName";
import useAuthorImage from "@/hooks/useAuthorImage";
import CommentArea from "./comments/commentArea";

interface GenerateTextFieldProps {
  photo: boolean | IPhoto;
  setImageIndex: (value: number) => void;
}

export default function ImageView({
  photo,
  setImageIndex,
}: GenerateTextFieldProps) {
  const currentImage = photo as ExtendedPhoto;
  const authorId = currentImage.author || "";
  const { data: userName, isLoading } = useAuthorUsername(authorId);
  const { data: image, isLoading: imageLoading } = useAuthorImage(authorId);

  const handleClose = () => {
    setImageIndex(-1);
  };

  if (!photo) return;

  return (
    <>
      <div
        onClick={handleClose}
        className="relative  top-0 left-0 h-screen w-full bg-gray-950/50 inset-0"
      ></div>

      <div className="fixed z-50 flex justify-center items-center top-0 left-0 h-screen w-full">
        <div
          onClick={handleClose}
          className="absolute flex justify-center items-center top-0 left-0 h-screen w-full"
        ></div>

        <div className="z-10 w-full md:w-11/12 xl:w-8/12 max-w-[968px] h-[100dvh] md:h-[624px] rounded-md border-primary-8 border-[1px] p-3 bg-primary-12">
          <div className="bg-primary-13 h-full w-full rounded-md">
            <div className="grid grid-cols-1 h-full md:grid-cols-2">
              <div className="h-full col-span-1 hidden md:block">
                <div className="relative w-full md:h-full">
                  <Image
                    src={currentImage.src}
                    fill={true}
                    alt=""
                    placeholder="blur"
                    blurDataURL="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                  />
                </div>
              </div>

              <div className="h-full">
                <CommentArea
                  image={image as string}
                  imageLoading={imageLoading}
                  userName={userName as string}
                  isLoading={isLoading}
                  authorId={authorId}
                  postId={currentImage.id}
                  imageDetails={currentImage}
                  handleClose={handleClose}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
