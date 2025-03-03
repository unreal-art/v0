import { supabase } from "$/supabase/client";
import {
  DownloadIcon,
  HeartFillIcon,
  PinFillIcon,
  HeartIcon,
  MessageIcon,
  PinIcon,
  ShareIcon,
} from "@/app/components/icons";
import { useComments, useRealtimeComments } from "@/hooks/useComments";
import { useLikePost } from "@/hooks/useLikePost";
import {
  useIsPostPinned,
  //usePinnedPosts,
  usePinPost,
  useUnpinPost,
} from "@/hooks/usePinnedPosts";
import { usePost } from "@/hooks/usePost";
import { usePostLikes } from "@/hooks/usePostLikes";
import { useUser } from "@/hooks/useUser";
import { getImage } from "../../formattedPhotos";
import { Post, UploadResponse } from "$/types/data.types";
import { downloadImage } from "$/utils";
import ShareModal from "../../components/modals/shareModal";
import { useState } from "react";

export default function Interactions({ postId }: { postId: number }) {
  const [openShare, setOpenShare] = useState(false);
  const { data: likes } = usePostLikes(Number(postId), supabase);
  const { data: comments } = useComments(postId.toString());
  useRealtimeComments(postId.toString());
  const { userId } = useUser();
  const { data: post } = usePost(Number(postId));
  const { mutate: toggleLike } = useLikePost(
    Number(postId),
    userId,
    post?.author as string
  );
  const userHasLiked = likes?.some((like) => like.author === userId);
  const { data: isPinned, isLoading } = useIsPostPinned(
    postId,
    userId as string
  );
  // const { data: pinnedPosts } = usePinnedPosts(userId as string);
  const { mutate: pinPost } = usePinPost(userId as string);
  const { mutate: unpinPost } = useUnpinPost(userId as string);
  const togglePostPin = () => {
    if (isPinned) {
      unpinPost(postId);
    } else {
      pinPost(postId);
    }
  };

  return (
    <div className="flex justify-between">
      <div className="flex py-2 gap-x-14">
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
          <p className="text-xs text-primary-3">{comments?.length}</p>
        </button>

        <button
          onClick={() => setOpenShare(true)}
          className="flex items-center gap-[2px] justify-center"
        >
          <ShareIcon color="#F0F0F0" />
          {/* <p className="text-xs text-primary-3">0</p> */}
        </button>
      </div>

      <div className="flex py-2 gap-x-6">
        <button onClick={() => togglePostPin()}>
          {isPinned ? (
            <PinFillIcon color="#F0F0F0" />
          ) : (
            <PinIcon color="#F0F0F0" />
          )}
        </button>

        <button
          onClick={() =>
            downloadImage(
              getImage(
                (post?.ipfsImages as UploadResponse[])?.[0]?.hash,
                (post?.ipfsImages as UploadResponse[])?.[0]?.fileNames[0]
              ),
              (post?.ipfsImages as UploadResponse[])?.[0]?.fileNames[0]
            )
          }
        >
          <DownloadIcon color="#F0F0F0" />
        </button>
      </div>
      {post && userId && (
        <ShareModal
          open={openShare}
          post={post as Post}
          userId={userId as string}
          setOpen={setOpenShare}
          link={"https://unreal.art/home/photo/" + postId}
        />
      )}
    </div>
  );
}
