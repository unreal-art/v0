"use client"
import { ReactNode, useState } from "react";
import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";


interface PhotoOverlayProps {
    hideContent?: true;
    children: ReactNode;
    setImageIndex: () => void;
}

export default function PhotoOverlay({ hideContent, children, setImageIndex } : PhotoOverlayProps) {
    const [hover, setHover] = useState(false)
    const [like, setLike]  = useState(false)

    const handleCommentClick = () => {
        setImageIndex(); // or any specific value you want to pass
    }

    return (
        <>
            <div 
                onMouseEnter={() => setHover(true)} 
                onMouseLeave={() => setHover(false)} 
                className="absolute top-0 left-0 w-full h-full flex flex-col text-primary-1 text-sm hover:bg-gray-900/50">

                {
                    hover &&
                        <div className="flex flex-col text-primary-1 justify-between px-4 py-3 h-full">
                            {
                                !hideContent ?
                                    <div className="flex justify-between text-primary-1 text-sm">
                                        <p>36s</p> 
                                        <button>
                                            <OptionMenuIcon color="#FFFFFF" />
                                        </button>
                                    </div>
                                    :
                                    <div> </div>
                            }

                            <div className="flex justify-center gap-4">
                                <button className="flex gap-1 items-center" onClick={() => setLike(!like)}>
                                    { like ? <HeartFillIcon color="#FFFFFF" /> : <HeartIcon  color="#FFFFFF" />}
                                    <p>25</p>
                                </button>
                                <button className="flex gap-1 items-center" onClick={() => handleCommentClick()}>
                                    <ChatIcon color="#FFFFFF" /> <p>300</p>
                                </button>
                            </div>

                            {!hideContent ? <p className="text-left text-primary-1 text-sm">Pixar Fest at Disneyland sounds amazing! I need to see the new parades! 🎉🎈</p> : <p></p>}
                        </div>

                }

                { !hover && children }
            
            </div>
        </>
    )
}