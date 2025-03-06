import { CommentWithUser } from "$/types/data.types";
import { CloseIcon, EmojiIcon } from "@/app/components/icons";
import { usePostComment } from "@/hooks/useComments";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { useState } from "react";

interface CommentTextboxProps {
  postId: string;
  replyTo: CommentWithUser | null;
  closeReply(): void;
  authorId: string;
}

export default function CommentTextbox({
  replyTo,
  postId,
  closeReply,
  authorId,
}: CommentTextboxProps) {
  const postComment = usePostComment();

  const [content, setContent] = useState<string | null>(null);
  const { userId } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !content.trim() || !userId) return;
    postComment.mutate({
      post_id: postId,
      content,
      parent_id: replyTo?.id,
      author: authorId,
      senderId: userId,
    });

    if (replyTo) closeReply();
    setContent("");
  };

  return (
    <div className="p-1">
      {replyTo && (
        <div className="h-16 rounded-t-lg w-full bg-primary-12 py-2 px-3 border-2 border-primary-10">
          <div className="flex justify-between w-full">
            <p className="font-bold text-primary-2 text-[10px]">REPLY TO</p>
            <button onClick={closeReply} className="w-3 h-3">
              <CloseIcon color="#F5F5F5" width={"10px"} height={"10px"} />
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <div>
              <Image
                src={replyTo.avatar_url || "/profile.jpg"}
                width={32}
                height={32}
                alt="profile"
                className="rounded-full"
              />
            </div>

            <div className="flex gap-3 mt-1">
              <p className="text-primary-4 text-xs font-medium">
                {replyTo.username}
              </p>
              <p className="text-xs text-primary-6 line-clamp-1">
                {replyTo.content}
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`flex h-16 bg-primary-10 px-2 ${
          replyTo ? "rounded-b-lg" : "m-1 mt-2 rounded-lg"
        }  pl-4`}
      >
        <button className="w-8">
          <EmojiIcon color="#C1C1C1" />
        </button>

        <textarea
          onChange={(e) => setContent(e.target.value)}
          value={content || ""}
          className="flex-grow bg-primary-10 outline-none resize-none mt-[18px] text-primary-4"
        ></textarea>

        <button
          disabled={!content}
          type="submit"
          className="text-primary-4 disable:text-primary-8 text-sm w-12"
        >
          Post
        </button>
      </form>
    </div>
  );
}
