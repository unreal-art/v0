"use client"
import GenerateInput from "../components/generateInput";
import photos from "./photos";
import Image from "next/image";
import TabBtn from "../components/tabBtn";
import { OptionMenuIcon } from "@/app/components/icons";
import PhotoOverlay from "../components/photoOverlay";
import { useState } from "react";


export default function Creation() {


  return (
    <div className="flex flex-col items-center background-color-primary-1 px-10 w-full">

      <div className="hidden md:flex flex-col justify-center items-center py-5 w-full">

        <GenerateInput />

        <div className="flex gap-x-2 items-center w-full h-6 py-3">
          <TabBtn text="Search" />
          <TabBtn text="Explore" />
          <TabBtn text="Following" />
          <TabBtn text="Top" />
        </div>

      </div>


      <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-4">
        {
          photos.map((photo, index) => {
            const [hover, setHover] = useState(false)
            return (
              <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} key={index} className="relative text-primary-1 text-sm">
                { 
                  hover &&
                    <div className="picture-gradient absolute top-0 left-0 h-12 w-full flex justify-between items-center px-3"> 
                      <p>36s</p>
                      <button><OptionMenuIcon color="#FFFFFF" /></button>
                    </div>
                }
                <Image src={photo.image} width={600} height={600} alt="" />
                { 
                  hover &&
                    <div className="picture-gradient absolute bottom-0 left-0 h-16 w-full p-3">
                      <p>Pixar Fest at Disneyland sounds amazing! I need to see the new parades! 🎉🎈</p>
                    </div>
                }
                <PhotoOverlay />
              </div>
            )
          })
        }
      </div>


    </div>
  );
}
