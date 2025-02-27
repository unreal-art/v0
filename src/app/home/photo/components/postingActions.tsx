import { Post } from "$/types/data.types";
import ActionBtn from "../../components/actionBtn";
import { useEffect, useState } from "react";

export default function PostingActions({
  privatePost,
  setPrivatePost,
}: {
  privatePost: boolean;
  setPrivatePost: (privatePost: boolean) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div>
        <div className="flex p-1 text-sm gap-x-4 rounded-full border-primary-9 border-[1px] w-44 md:w-fit">
          <button
            onClick={() => setPrivatePost(false)}
            className={`rounded-full text-primary-5 px-4 h-8 ${
              !privatePost && "bg-primary-9"
            }`}
          >
            Public
          </button>

          <button
            onClick={() => setPrivatePost(true)}
            className={`rounded-full text-primary-5 px-4 h-8 ${
              privatePost && "bg-primary-9"
            }`}
          >
            Private
          </button>
        </div>
      </div>

      <div className="flex justify-end py-2 md:py-0 md:gap-x-6">
        <button className="text-primary-6 font-semibold px-9 py-3">
          Save to drafts
        </button>

        <ActionBtn onClick={() => console.log("Clicked")}>Post</ActionBtn>
      </div>
    </div>
  );
}
