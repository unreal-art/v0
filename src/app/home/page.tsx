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
    <div className="relative flex flex-col items-center background-color-primary-1 px-10 w-full">

      <div className="hidden md:flex flex-col justify-center items-center py-5 w-full">

        <GenerateInput />

        <div className="flex gap-x-2 items-center w-full h-6 py-3">
          <TabBtn text="Search" />
          <TabBtn text="Explore" />
          <TabBtn text="Following" />
          <TabBtn text="Top" />
        </div>

      </div>

      <PhotoGallary />

    </div>
  );
}