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
import ImageOptionMenu from "./imageOptionMenu";
import { useRouter } from "next/navigation";

export interface ExtendedRenderPhotoContext extends RenderPhotoContext {
  photo: Photo & {
    prompt: string;
    id: string;
    author: string;
    createdAt: string;
    caption?: string;
  }; // Extending `Photo`
}

interface PhotoOverlayProps {
  hideContent?: true;
  children: ReactNode;
  setImageIndex: () => void;
  context: ExtendedRenderPhotoContext;
  photo?: ReactNode; 
}

export default function PhotoOverlay({
  hideContent,
  children,
  setImageIndex,
  context,
  photo
}: PhotoOverlayProps) {

  const router = useRouter()

  const [hover, setHover] = useState(false);
  // const [like, setLike] = useState(false);
  const { userId } = useUser();
  const { data: likes, isLoading: loadingLikes } = usePostLikes(
    Number(context.photo.id),
    supabase
  );
  const { mutate: toggleLike } = useLikePost(
    Number(context.photo.id),
    userId,
    context.photo.author
  );

  const userHasLiked = likes?.some((like) => like.author === userId);

  // console.log(context.photo.createdAt);
  const handleCommentClick = () => {
    setImageIndex(); // or any specific value you want to pass
  };

  const { data: comments, isLoading: loadingComments } = useComments(
    context.photo.id
  );
  useRealtimeComments(context.photo.id);

  const handleView = () => {
    router.push("/home/photo/" + context.photo.id)
  }

  return (
    <>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="absolute top-0 left-0 w-full h-full flex flex-col text-primary-1 text-sm hover:bg-gray-900/50"
      >
        {hover && (
          <div className="relative flex flex-col text-primary-1 justify-between px-4 py-3 h-full">
            
            <div onClick={handleView} className="absolute top-0 left-0 w-full h-full"> {photo} </div>

            <div onClick={handleView} className="absolute top-0 left-0 w-full h-full cursor-pointer"></div>
            {!hideContent ? (
              <div className="flex justify-between text-primary-1 text-sm z-20">
                <p>{timeAgo(context.photo.createdAt)}</p>
                <ImageOptionMenu image={context.photo}>
                  <OptionMenuIcon color="#FFFFFF" />
                </ImageOptionMenu>
              </div>
            ) : (
              <div> </div>
            )}

            {!loadingLikes && !loadingComments && (
              <div className="flex justify-center gap-4 z-10">
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
            )}

            {!hideContent ? (
              <p className="text-left text-primary-1 text-sm z-10">
                {truncateText(context.photo.caption || context.photo.prompt)}
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
