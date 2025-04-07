"use client";
import { BackIcon, CloseIcon, OptionMenuIcon } from "@/app/components/icons";
import Image from "next/image";
import ImageViewInteractions from "../imageViewInteractions";
import CommentTextbox from "./commentTextbox";
import Comment from "./comment";
import { useState } from "react";
import { useComments, useRealtimeComments } from "@/hooks/useComments";
import { CommentWithUser } from "$/types/data.types";
import ImageOptionMenu from "../imageOptionMenu";
import { IPhoto } from "@/app/libs/interfaces";
import { Following } from "../followingBtn";
import OptimizedImage from "@/app/components/OptimizedImage";
import { capitalizeFirstAlpha } from "@/utils";

interface CommentAreaProps {
  image: string;
  imageLoading: boolean;
  userName: string;
  isLoading: boolean;
  authorId: string;
  postId: string;
  imageDetails: IPhoto;
  handleClose: () => void;
}

export default function CommentArea({
  image,
  imageLoading,
  userName,
  isLoading,
  authorId,
  postId,
  imageDetails,
  handleClose,
}: CommentAreaProps) {
  const { data: comments } = useComments(postId);
  useRealtimeComments(postId);
  const [replyTo, setReplyTo] = useState<CommentWithUser | null>(null);

  const handleCloseReply = () => {
    setReplyTo(null);
  };

  return (
    <div className="md:flex md:flex-col">
      <div className="md:p-[2px]">
        <div className="flex justify-between h-18 py-2 px-2 md:px-5 gap-5 w-full text-sm lg:text-base">
          <div className="flex gap-1 items-center">
            <div className="flex items-center">
              <button onClick={handleClose} className="p-4 md:hidden">
                <BackIcon width={24} height={24} color="#C1C1C1" />
              </button>
              {!imageLoading && (
                <OptimizedImage
                  className="rounded-full  drop-shadow-lg"
                  src={image || ""}
                  width={48}
                  height={48}
                  alt={`${userName || "Unknown"}'s profile picture`}
                  imageName="comment-area-avatar"
                  trackPerformance={true}
                />
              )}
            </div>

            <div>
              <p className="font-semibold text-lg leading-6 text-primary-2">
                {isLoading
                  ? "Loading..."
                  : capitalizeFirstAlpha(userName) || "Unknown"}
              </p>
              <p className="text-primary-7 nasalization">Creator</p>
            </div>

            <div className=" h-full pl-2 hidden lg:block">
              <Following authorId={authorId} />
            </div>
          </div>
          <div className="h-full py-2">
            <ImageOptionMenu image={imageDetails}>
              <OptionMenuIcon color="#C1C1C1" />
            </ImageOptionMenu>
          </div>
        </div>
      </div>

      <div className="px-6">
        <hr />
      </div>

      <div
        className={`py-2 px-6 overflow-y-auto ${
          replyTo
            ? "h-[calc(100dvh_-_285px)] md:h-[346px]"
            : "h-[calc(100dvh_-_235px)] md:h-[400px]"
        }`}
      >
        {comments?.map((comment: CommentWithUser, index: number) => (
          <Comment key={index} data={comment} setReplyTo={setReplyTo} />
        ))}
      </div>

      <div className="flex py-2 px-6 border-y-[1px] border-primary-6">
        <ImageViewInteractions
          commentCount={comments?.length || 0}
          postId={postId}
        />
      </div>

      <div>
        <CommentTextbox
          postId={postId}
          replyTo={replyTo}
          closeReply={handleCloseReply}
          authorId={authorId}
        />
      </div>
    </div>
  );
}
