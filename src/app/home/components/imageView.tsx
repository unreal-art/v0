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
  if (!photo) return;

  return (
    <>
      <div
        onClick={() => setImageIndex(-1)}
        className="fixed  top-0 left-0 h-screen w-full bg-gray-950/50"
      ></div>

      <div className="absolute flex justify-center items-center top-0 left-0 h-screen w-full">
        <div
          onClick={() => setImageIndex(-1)}
          className="absolute flex justify-center items-center top-0 left-0 h-screen w-full"
        ></div>

        <div className="z-10 w-full md:w-8/12 max-w-[968px] h-full md:h-[624px] rounded-md border-primary-8 border-[1px] p-3 bg-primary-12">
          <div className="bg-primary-13 h-full w-full rounded-md">
            <div className="grid grid-cols-1 h-full md:grid-cols-2">
              <div className="h-full col-span-1">
                <div className="relative w-full h-full">
                  <Image src={currentImage.src} fill={true} alt="" />
                </div>
              </div>

              <div className="h-fit">
                <CommentArea
                  image={image as string}
                  imageLoading={imageLoading}
                  userName={userName as string}
                  isLoading={isLoading}
                  postId={currentImage.id}
                  imageDetails={currentImage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  );
  
}
