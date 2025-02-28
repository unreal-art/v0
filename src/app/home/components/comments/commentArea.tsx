import { OptionMenuIcon } from "@/app/components/icons";
import Image from "next/image";
import ImageViewInteractions from "../imageViewInteractions";
import CommentTextbox from "./commentTextbox";
import Comment from "./comment";
import { useState } from "react";
import { useComments, useRealtimeComments } from "@/hooks/useComments";
import { CommentWithUser } from "$/types/data.types";
import ImageOptionMenu from "../imageOptionMenu";
import { ExtendedRenderPhotoContext } from "../photoOverlay";
import { IPhoto } from "@/app/libs/interfaces";

interface CommentAreaProps {
  image: string;
  imageLoading: boolean;
  userName: string;
  isLoading: boolean;
  postId: string;
  imageDetails: IPhoto;
}

export default function CommentArea({
  image,
  imageLoading,
  userName,
  isLoading,
  postId,
  imageDetails
}: CommentAreaProps) {
  const { data: comments } = useComments(postId);
  useRealtimeComments(postId);
  // console.log(comments);
  const [reply, setReply] = useState(false);
  const handleCloseReply = () => {
    setReply(false);
  };

  return (
    <div className="flex flex-col">
      <div className="p-[2px]">
        <div className="flex justify-between h-18 py-2 px-5 gap-5 w-full">
          <div className="flex gap-1">
            <div className="flex items-center">
              {!imageLoading && (
                <Image
                  className="rounded-full border-[1px] border-primary-3 drop-shadow-lg"
                  src={image || ""}
                  width={48}
                  height={48}
                  alt="profile"
                />
              )}
            </div>

            <div>
              <p className="font-semibold text-lg leading-6 text-primary-2">
                {isLoading ? "Loading..." : userName || "Unknown"}
              </p>
              <p className="text-primary-7 nasalization">Creator</p>
            </div>
          </div>
          <ImageOptionMenu image={imageDetails}>
            <div className="h-8">
                <OptionMenuIcon color="#C1C1C1" />
            </div>
           </ImageOptionMenu>
        </div>
      </div>

      <div className="px-6">
        {" "}
        <hr />{" "}
      </div>

      <div
        className={`flex-grow py-2 px-6 overflow-y-auto ${reply ? "h-[calc(40vh_-_64px)] md:h-[346px]" : "h-[40vh] md:h-[400px]"}`}
      >
        {comments?.map((comment: CommentWithUser, index: number) => (
          <Comment key={index} {...comment} />
        ))}
      </div>

      <div className="flex py-2 px-6 border-y-[1px] border-primary-6">
        {" "}
        <ImageViewInteractions
          commentCount={comments.length}
          postId={postId}
        />{" "}
      </div>

      <div>
        {" "}
        <CommentTextbox
          postId={postId}
          reply={reply}
          closeReply={handleCloseReply}
        />{" "}
      </div>
    </div>
  );
}
