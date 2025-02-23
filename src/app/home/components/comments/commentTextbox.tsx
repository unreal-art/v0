import { EmojiIcon } from "@/app/components/icons";
import { usePostComment } from "@/hooks/useComments";
import { useState } from "react";

export default function CommentTextbox({ postId }: { postId: string }) {
  const postComment = usePostComment();

  const [content, setContent] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !content.trim()) return;
    postComment.mutate({ post_id: postId, content });
    setContent(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-16 bg-primary-10 px-2 m-1 mt-2 pl-4 rounded-lg"
    >
      <button className="w-8">
        <EmojiIcon color="#C1C1C1" />
      </button>

      <textarea
        onChange={(e) => setContent(e.target.value)}
        value={content as string}
        className="flex-grow bg-primary-10 outline-none resize-none mt-[18px] text-primary-4"
      ></textarea>

      <button type="submit" className="text-primary-8 text-sm w-12">
        Post
      </button>
    </form>
  );
}
