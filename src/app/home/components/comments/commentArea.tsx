import { OptionMenuIcon } from "@/app/components/icons";
import Image from "next/image";
import ImageViewInteractions from "../imageViewInteractions";
import CommentTextbox from "./commentTextbox";
import Comment from "./comment";
import { useState } from "react";


interface CommentAreaProps {
    image: string;
    imageLoading: boolean;
    userName: string;
    isLoading: boolean;
}

const dummyComments = [1,2,3,4,5,1,2,3,4,5];

export default function CommentArea({ image, imageLoading, userName, isLoading }: CommentAreaProps) { 
    const [reply, setReply] = useState(true);
    const handleCloseReply = () => {
        setReply(false);
    }
    return (
        <div className="flex flex-col">
            
            <div className="p-[2px]">
            
                <div className="flex justify-between h-18 py-2 px-5 gap-5 w-full">
            
                    <div className="flex gap-1">
            
                        <div className="flex items-center">
                        {
                            !imageLoading && (
                                <Image
                                    className="rounded-full border-[1px] border-primary-3 drop-shadow-lg"
                                    src={image || ""}
                                    width={48}
                                    height={48}
                                    alt="profile"
                                    />
                                )
                        }
                        </div>
            
                    <div>
                        <p className="font-semibold text-lg leading-6 text-primary-2">
                            {isLoading ? "Loading..." : userName || "Unknown"}
                        </p>
                        <p className="text-primary-7 nasalization">Creator</p>
                    </div>
                
                </div>
                    <button className="h-8"><OptionMenuIcon color="#C1C1C1" /></button>
                </div>
           
            </div>

            <div className="px-6">  <hr />  </div>

            <div className={`flex-grow py-2 px-6 overflow-y-auto ${reply ? "h-[calc(40vh_-_64px)] md:h-[346px]" : "h-[40vh] md:h-[400px]"}`}>
                {
                    dummyComments.map((_, index) => (<Comment key={index} comment="just shared your AI-generated image! Your art is reaching more people." user="Kaylynn" date="10 H" />))
                }
            </div>

            <div className="flex py-2 px-6 border-y-[1px] border-primary-6">    <ImageViewInteractions />   </div>

            <div>   <CommentTextbox reply={reply} closeReply={handleCloseReply} />  </div>

        </div>
    )
}