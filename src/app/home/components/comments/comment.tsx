"use client";
import { HeartFillIcon, HeartIcon } from "@/app/components/icons";
import { CommentWithUser } from "$/types/data.types";
import { timeAgo } from "@/app/libs/timeAgo";
import useAuthorUsername from "@/hooks/useAuthorUserName";
import Image from "next/image";
import {
  useLikeComment,
  useRealtimeReplies,
  useReplies,
  useUnlikeComment,
} from "@/hooks/useComments";
import Reply from "./Reply";
import { useState } from "react";
import { formatNumber } from "@/utils";

export default function Comment({
  data,
  setReplyTo,
  // setCommentToReply,
}: {
  data: CommentWithUser;
  setReplyTo: (data: CommentWithUser | null) => void;
  // setCommentToReply: (data: CommentWithUser) => void;
}) {
  const { data: user } = useAuthorUsername(data.user_id);
  const likeComment = useLikeComment(data.post_id.toString());
  const unlikeComment = useUnlikeComment(data.post_id.toString());
  const [seeMore, setSeeMore] = useState(false);

  const { data: replies } = useReplies(data.id);
  useRealtimeReplies(data.id);

  return (
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

          <div className="flex gap-2 w-full py-2">
            <div className="flex-grow space-y-4 gap-4">
              <p className="text-primary-6 text-sm flex-grow">{data.content}</p>
              <button
                className="text-primary-9  text-xs"
                onClick={() => {
                  data.username = user as string;
                  setReplyTo(data);
                }}
              >
                reply ({replies ? formatNumber(replies.length) : ""})
              </button>
            </div>
            <div className="justify-end">
              <button
                className="flex gap-1 items-center"
                onClick={() =>
                  data.user_liked
                    ? unlikeComment.mutate(data.id)
                    : likeComment.mutate(data.id)
                }
              >
                {data.user_liked ? (
                  <HeartFillIcon color="#FFFFFF" />
                ) : (
                  <HeartIcon color="#FFFFFF" />
                )}
              </button>
              <p className="text-center">{formatNumber(data.like_count)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reply list */}

      {replies
        ?.slice(0, seeMore ? replies.length : 2)
        .map((reply: CommentWithUser, idx: number) => (
          <Reply key={idx} data={reply} />
        ))}

      {replies && replies?.length > 2 && (
        <p className="text-right">
          <button
            onClick={() => setSeeMore(!seeMore)}
            className="text-xs hover:underline"
          >
            {seeMore ? "Show Less" : "See More"}
          </button>
        </p>
      )}
    </div>
  );
}
