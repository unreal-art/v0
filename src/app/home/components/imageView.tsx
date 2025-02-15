import { OptionMenuIcon } from "@/app/components/icons";
import { IPhoto } from "@/app/libs/interfaces";
import Image from "next/image";
import ImageViewInteractions from "./imageViewInteractions";
import CommentTextbox from "./commentTextbox";

interface GenerateTextFieldProps {
    photo: boolean | IPhoto;
    setImageIndex: (value: number) => void;
}

export default function ImageView ({ photo, setImageIndex } : GenerateTextFieldProps) {

    console.log({photo})

    if (!photo) return

    const currentImage = photo as IPhoto

    return (
        <>
            <div onClick={() => setImageIndex(-1)} className="fixed  top-0 left-0 h-screen w-full bg-gray-950/50"></div>

            <div className="absolute flex justify-center items-center top-0 left-0 h-screen w-full">
                
                <div onClick={() => setImageIndex(-1)} className="absolute flex justify-center items-center top-0 left-0 h-screen w-full"></div>

                <div className="z-10 w-full md:w-8/12 max-w-[685px] h-full md:h-[432px] rounded-md border-primary-8 border-[1px] p-3 bg-primary-12">

                    <div className="flex flex-col bg-primary-13 h-full w-full rounded-md">

                        <div className="grid grid-cols-1 md:grid-cols-2 h-full">

                            <div className="h-full col-span-1">
                                <div className="relative w-full h-full">                                
                                    <Image src={currentImage.src} fill={true}  alt="" /> 
                                </div>
                            </div>

                            <div className="flex flex-col">

                                <div className="p-[2px]">

                                    <div className="flex justify-between h-18 py-2 px-5 gap-5 w-full">
                                        <div className="flex gap-1">
                                            <div>   
                                                <Image src={"/icons/dummy-profile.png"} alt="profile" width={48} height={48} /> 
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg leading-6 text-primary-2">David Johnson</p>
                                                <p className="text-primary-7 nasalization">Creator</p>
                                            </div>
                                        </div>
                                        <button className="h-8">
                                            <OptionMenuIcon color="#C1C1C1" />
                                        </button>
                                    </div>
                                
                                </div>

                                <div className="px-6">
                                    <hr />
                                </div>

                                <div className="flex-grow py-2 px-6 overflow-auto">

                                </div>

                                <div className="flex py-2 px-6 border-y-[1px] border-primary-6">
                                    <ImageViewInteractions />
                                </div>

                                <div>
                                    <CommentTextbox />
                                </div>

                            </div>
                    
                        </div>

                    </div>

                </div>

            </div>

        </>
    )
}