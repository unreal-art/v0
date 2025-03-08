import GenerateInput from "./components/generateInput";
import TabBtn from "./components/tabBtn";
import dynamic from "next/dynamic";
import { HydrationBoundary } from "@tanstack/react-query";
import Search from "./components/search";
import Skeleton from "react-loading-skeleton";
import PostsProvider from "./components/PostsProvider";

const PhotoGallary = dynamic(() => import("./components/photoGallary"), {
  ssr: true,
  loading: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2  w-full ">
      {Array(12)
        .fill(null)
        .map((_, index) => (
          <Skeleton
            key={index}
            height={200}
            baseColor="#1a1a1a"
            highlightColor="#333"
          />
        ))}
    </div>
  ),
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchType = await searchParams;

  return (
    <PostsProvider searchType={searchType?.s}>
      <div className="relative flex flex-col items-center background-color-primary-1 px-1 md:px-10 w-full">
        <div className="hidden md:flex flex-col justify-center items-center pt-5 w-full">
          <GenerateInput />
        </div>

        <div className="flex gap-x-2 items-center w-full h-10 mt-3 md:mt-0 mb-2 relative">
          <Search />
          <TabBtn text="Explore" />
          <TabBtn text="Following" />
          <TabBtn text="Top" />
        </div>

        <div className="overflow-y-auto w-full">
          <PhotoGallary />
        </div>
      </div>
    </PostsProvider>
  );
}
