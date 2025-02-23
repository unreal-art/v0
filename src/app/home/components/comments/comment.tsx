import { CommentWithUser } from "$/types/data.types";
import { timeAgo } from "@/app/libs/timeAgo";
import useAuthorUsername from "@/hooks/useAuthorUserName";
import Image from "next/image";

export default function Comment(data: CommentWithUser) {
  const { data: user } = useAuthorUsername(data.user_id);

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
      <div className="flex gap-2">
        <div className="flex flex-col">
          <p className="text-primary-4 text-md font-medium">{user}</p>
          <p className="text-xs">{timeAgo(data.created_at)}</p>
        </div>
        <p className="text-primary-6 text-sm">{data.content}</p>
      </div>
    </div>
  );
}
