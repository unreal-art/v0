"use client";
import { ReactNode, useState } from "react";
import {
  ChatIcon,
  HeartFillIcon,
  HeartIcon,
  OptionMenuIcon,
} from "@/app/components/icons";
import { Photo, RenderPhotoContext } from "react-photo-album";
import { truncateText } from "$/utils";
import { usePostLikes } from "@/hooks/usePostLikes";
import { supabase } from "$/supabase/client";
import { useLikePost } from "@/hooks/useLikePost";
import { useUser } from "@/hooks/useUser";
import { timeAgo } from "@/app/libs/timeAgo";
import { useComments, useRealtimeComments } from "@/hooks/useComments";

export interface ExtendedRenderPhotoContext extends RenderPhotoContext {
  photo: Photo & {
    prompt: string;
    id: string;
    author: string;
    createdAt: string;
  }; // Extending `Photo`
}

interface PhotoOverlayProps {
  hideContent?: true;
  children: ReactNode;
  setImageIndex: () => void;
  context: ExtendedRenderPhotoContext;
}

export default function PhotoOverlay({
  hideContent,
  children,
  setImageIndex,
  context,
}: PhotoOverlayProps) {
  const [hover, setHover] = useState(false);
  // const [like, setLike] = useState(false);
  const { userId } = useUser();
  const { data: likes } = usePostLikes(Number(context.photo.id), supabase);
  const { mutate: toggleLike } = useLikePost(
    Number(context.photo.id),
    userId,
    context.photo.author,
  );
  const userHasLiked = likes?.some((like) => like.author === userId);

  // console.log(context.photo.createdAt);
  const handleCommentClick = () => {
    setImageIndex(); // or any specific value you want to pass
  };

  const { data: comments } = useComments(context.photo.id);
  useRealtimeComments(context.photo.id);

  return (
    <>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="absolute top-0 left-0 w-full h-full flex flex-col text-primary-1 text-sm hover:bg-gray-900/50"
      >
        {hover && (
          <div className="flex flex-col text-primary-1 justify-between px-4 py-3 h-full">
            {!hideContent ? (
              <div className="flex justify-between text-primary-1 text-sm">
                <p>{timeAgo(context.photo.createdAt)}</p>
                <button>
                  <OptionMenuIcon color="#FFFFFF" />
                </button>
              </div>
            ) : (
              <div> </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                className="flex gap-1 items-center"
                onClick={() => toggleLike()}
              >
                {userHasLiked ? (
                  <HeartFillIcon color="#FFFFFF" />
                ) : (
                  <HeartIcon color="#FFFFFF" />
                )}
                <p>{likes?.length}</p>
              </button>

              <button
                className="flex gap-1 items-center"
                onClick={() => handleCommentClick()}
              >
                <ChatIcon color="#FFFFFF" /> <p>{comments?.length}</p>
              </button>
            </div>

            {!hideContent ? (
              <p className="text-left text-primary-1 text-sm">
                {truncateText(context.photo.prompt)}
              </p>
            ) : (
              <p></p>
            )}
          </div>
        )}

        {!hover && children}
      </div>
    </>
  );
}
