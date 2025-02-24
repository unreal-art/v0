import { supabase } from "$/supabase/client";
import {
  DownloadIcon,
  HeartFillIcon,
  HeartIcon,
  MessageIcon,
  ShareIcon,
} from "@/app/components/icons";
import { useLikePost } from "@/hooks/useLikePost";
import usePost from "@/hooks/usePost";
import { usePostLikes } from "@/hooks/usePostLikes";
import { useUser } from "@/hooks/useUser";
import React from "react";

interface IInteractions {
  commentCount: number;
  postId: string;
}
export default function ImageViewInteractions({
  commentCount,
  postId,
}: IInteractions) {
  const { data: likes } = usePostLikes(Number(postId), supabase);
  const { userId } = useUser();
  const { data: post } = usePost(Number(postId));
  const { mutate: toggleLike } = useLikePost(
    Number(postId),
    userId,
    post?.author as string,
  );
  const userHasLiked = likes?.some((like) => like.author === userId);

  return (
    <div className="flex justify-between w-full">
      <button
        onClick={() => toggleLike()}
        className="flex items-center gap-[2px] justify-center"
      >
        {userHasLiked ? (
          <HeartFillIcon color="#FFFFFF" />
        ) : (
          <HeartIcon color="#FFFFFF" />
        )}
        <p className="text-xs text-primary-3">{likes?.length}</p>
      </button>

      <button className="flex items-center gap-[2px] justify-center">
        <MessageIcon color="#F0F0F0" />
        <p className="text-xs text-primary-3">{commentCount}</p>
      </button>

      <button className="flex items-center gap-[2px] justify-center">
        <ShareIcon color="#F0F0F0" />
        <p className="text-xs text-primary-3">0</p>
      </button>

      <button>
        <DownloadIcon color="#F0F0F0" />
      </button>
    </div>
  );
}
