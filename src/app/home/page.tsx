"use client"
import GenerateInput from "./components/generateInput";
import TabBtn from "./components/tabBtn";
import dynamic from 'next/dynamic'
 
const PhotoGallary = dynamic(
  () => import("./components/photoGallary"),
  { ssr: false }
)

export default function Home() {

  return (
    <div className="relative flex flex-col items-center background-color-primary-1 px-1 md:px-10 w-full">

      <div className="hidden md:flex flex-col justify-center items-center pt-5 w-full">
        <GenerateInput />
      </div>

      <div className="flex gap-x-2 items-center w-full h-10 mt-8 md:mt-0 mb-2">
        <TabBtn text="Search" />
        <TabBtn text="Explore" />
        <TabBtn text="Following" />
        <TabBtn text="Top" />
      </div>

      <div className="overflow-y-auto"> <PhotoGallary /> </div>

    </div>
  );
}