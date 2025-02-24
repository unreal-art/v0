import { CloseIcon, EmojiIcon } from "@/app/components/icons";
import Image from "next/image";

interface CommentTextboxProps {
    reply: boolean;
    closeReply():  void;
}

export default function CommentTextbox ({ reply, closeReply }: CommentTextboxProps) {
    return (
        <div className="p-1">
            {   
                reply &&
                    <div className="h-16 rounded-t-lg w-full bg-primary-12 py-2 px-3 border-2 border-primary-10">

                        <div className="flex justify-between w-full">
                            <p className="font-bold text-primary-2 text-[10px]">REPLAY TO</p>
                            <button onClick={closeReply} className="w-3 h-3">
                                <CloseIcon color="#F5F5F5" width={"10px"} height={"10px"} />
                            </button>
                        </div>

                        <div className="flex gap-2 items-center">

                            <div>
                                <Image src={"/icons/dummy-profile.png"} width={32} height={32} alt="profile" /> 
                            </div>

                            <div className="flex gap-3 mt-1">
                                <p className="text-primary-4 text-xs font-medium">David</p>
                                <p className="text-xs text-primary-6 line-clamp-1">Pixar Fest at Disneyland sounds amazing! I need to see the new parades! 🎉🎈max isol</p>   
                            </div>

                        </div>

                    </div>
            }

            <div className={`flex h-16 bg-primary-10 px-2 ${reply ? "rounded-b-lg" : "m-1 mt-2 rounded-lg"}  pl-4`}>

                <button className="w-8">
                    <EmojiIcon color="#C1C1C1" />
                </button>

                <textarea className="flex-grow bg-primary-10 outline-none resize-none mt-[18px] text-primary-4">

                </textarea>

                <button className="text-primary-8 text-sm w-12">Post</button>

            </div>
            
        </div>
    )
}