import { EmojiIcon } from "@/app/components/icons";

export default function CommentTextbox () {
    return (
        <div className="flex h-16 bg-primary-10 px-2 m-1 mt-2 pl-4 rounded-lg">

            <button className="w-8">
                <EmojiIcon color="#C1C1C1" />
            </button>

            <textarea className="flex-grow bg-primary-10 outline-none resize-none mt-[18px] text-primary-4">

            </textarea>

            <button className="text-primary-8 text-sm w-12">Post</button>

        </div>
    )
}