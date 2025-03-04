import { HeartFillIcon, HeartIcon } from "@/app/components/icons";
import { CommentWithUser } from "$/types/data.types";
import { timeAgo } from "@/app/libs/timeAgo";
import useAuthorUsername from "@/hooks/useAuthorUserName";
import Image from "next/image";
import { useLikeComment, useUnlikeComment } from "@/hooks/useComments";

export default function Comment(data: CommentWithUser) {
  const { data: user } = useAuthorUsername(data.user_id);
  const likeComment = useLikeComment(data.post_id.toString());
  const unlikeComment = useUnlikeComment(data.post_id.toString());

  return (
    <div className="flex gap-2 py-2">
      <div className="h-12 w-12">
        <Image
          src={data.avatar_url || "/profile.jpg"}
          width={48}
          height={48}
          alt="profile"
          className="rounded-full"
        />
      </div>
      <div className="flex gap-2 w-full">
        <div className="flex flex-col">
          <p className="text-primary-4 text-md font-medium">{user}</p>
          <p className="text-xs">{timeAgo(data.created_at)}</p>
        </div>
        <p className="text-primary-6 text-sm flex-grow">{data.content}</p>
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
          <p className="text-center">{data.like_count}</p>
        </div>
      </div>
    </div>
  );
}
