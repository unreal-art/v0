"use client";
import { HeartFillIcon, HeartIcon } from "@/app/components/icons";
import { CommentWithUser } from "$/types/data.types";
import { timeAgo } from "@/app/libs/timeAgo";
import useAuthorUsername from "@/hooks/useAuthorUserName";
import Image from "next/image";
import {
  useLikeComment,
  useLikeReply,
  useRealtimeReplies,
  useReplies,
  useUnlikeComment,
  useUnlikeReply,
} from "@/hooks/useComments";

export default function Reply({
  data,
  // setReplyTo,
  // setCommentToReply,
}: {
  data: CommentWithUser;
  // setReplyTo: (data: CommentWithUser | null) => void;
  // setCommentToReply: (data: CommentWithUser) => void;
}) {
  const { data: user } = useAuthorUsername(data.user_id);
  const likeReply = useLikeReply(
    data.post_id.toString(),
    data.parent_id as string,
  );
  const unlikeReply = useUnlikeReply(
    data.post_id.toString(),
    data.parent_id as string,
  );

  return (
    <div className="pl-10 ">
      <div className=" gap-2 py-2  border-primary-10">
        <div className="flex w-full  gap-2">
          <div className="h-12 w-12">
            <Image
              src={data.avatar_url || "/profile.jpg"}
              width={48}
              height={48}
              alt="profile"
              className="rounded-full"
            />
          </div>
          <div className="w-full">
            <div className="flex flex-col basis-1/6">
              <p className="text-primary-4 text-md font-medium whitespace-nowrap">
                {user}
              </p>
              <p className="text-xs">{timeAgo(data.created_at)}</p>
            </div>

            <div className="flex gap-2 w-full pt-2">
              <div className="flex-grow space-y-4 gap-4">
                <p className="text-primary-6 text-sm flex-grow">
                  {data.content}
                </p>
              </div>
              <div className="justify-end">
                <button
                  className="flex gap-1 items-center"
                  onClick={() =>
                    data.user_liked
                      ? unlikeReply.mutate(data.id)
                      : likeReply.mutate(data.id)
                  }
                >
                  {data.user_liked ? (
                    <HeartFillIcon color="#FFFFFF" />
                  ) : (
                    <HeartIcon color="#FFFFFF" />
                  )}
                </button>
                <p className="text-center">{data.like_count}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
