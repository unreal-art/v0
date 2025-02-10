"use client"
import { useState } from "react";
import { ChatIcon, HeartFillIcon, HeartIcon, OptionMenuIcon } from "@/app/components/icons";


export default function PhotoOverlay() {
  const [hover, setHover] = useState(false)
  const [like, setLike]  = useState(false)

  return (
    <div 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)} 
      className="absolute top-0 left-0 w-full h-full flex flex-col text-primary-1 text-sm justify-between p-4 hover:bg-gray-900/50">

        {
          hover &&
          <>
            <div className="flex justify-between text-primary-1 text-sm">
              <p>36s</p> 
              <button>
                <OptionMenuIcon color="#FFFFFF" />
              </button>
            </div>

            <div className="flex justify-center gap-4">
              <button className="flex gap-1 items-center" onClick={() => setLike(!like)}>
                { like ? <HeartFillIcon color="#FFFFFF" /> : <HeartIcon  color="#FFFFFF" />}
                <p>25</p>
              </button>
              <button className="flex gap-1 items-center" onClick={() => setLike(!like)}>
                <ChatIcon color="#FFFFFF" /> <p>300</p>
              </button>
            </div>

            <p className="text-left text-primary-1 text-sm">Pixar Fest at Disneyland sounds amazing! I need to see the new parades! 🎉🎈</p>
          </>

        }

        {
          !hover && <div></div>
        }
      
    </div>
  )
}