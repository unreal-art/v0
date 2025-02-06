"use client"
import GenerateInput from "../components/generateInput";
import photos from "./photos";
import Image from "next/image";
import TabBtn from "../components/tabBtn";


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
            return (
              <div key={index} className="">
                <Image src={photo.image} width={600} height={600} alt="" />
              </div>
            )
          })
        }
      </div>


    </div>
  );
}
