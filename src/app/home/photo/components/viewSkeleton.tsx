import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Define consistent skeleton colors for the app
const skeletonBaseColor = "#1a1a1a";
const skeletonHighlightColor = "#333";

const PostLoadingSkeleton = () => {
  return (
    <div className="relative flex flex-col items-center background-color-primary-1 px-1 md:px-10 w-full">
      {/* Input Section */}
      <div className="hidden md:flex flex-col justify-center items-center pt-5 w-full">
        <Skeleton
          height={48}
          width="60%"
          borderRadius={8}
          baseColor={skeletonBaseColor}
          highlightColor={skeletonHighlightColor}
        />
      </div>

      {/* Back Button */}
      <div className="flex gap-x-2 items-center w-full h-10 mt-8 md:mt-0 mb-4">
        <Skeleton
          width={120}
          height={20}
          borderRadius={4}
          baseColor={skeletonBaseColor}
          highlightColor={skeletonHighlightColor}
        />
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full md:min-h-[calc(100vh_-_220px)]">
          {/* Left Column - Post Content */}
          <div className="flex flex-col justify-start items-center col-span-9 md:pr-4">
            {/* Profile Info */}
            <div className="flex justify-between h-24 p-6 w-full">
              <div className="flex gap-3">
                <Skeleton
                  circle
                  width={48}
                  height={48}
                  baseColor={skeletonBaseColor}
                  highlightColor={skeletonHighlightColor}
                />
                <div className="flex flex-col justify-center">
                  <Skeleton
                    width={120}
                    height={20}
                    baseColor={skeletonBaseColor}
                    highlightColor={skeletonHighlightColor}
                    className="mb-2"
                  />
                  <Skeleton
                    width={80}
                    height={14}
                    baseColor={skeletonBaseColor}
                    highlightColor={skeletonHighlightColor}
                  />
                </div>
              </div>
              <Skeleton
                width={24}
                height={24}
                baseColor={skeletonBaseColor}
                highlightColor={skeletonHighlightColor}
              />
            </div>

            {/* Generated Image Placeholder */}
            <div className="flex justify-center w-full my-4">
              <div className="w-[306px] h-[408px] sm:w-[350px] sm:h-[450px] md:w-[400px] md:h-[500px] lg:w-[450px] lg:h-[550px] xl:w-[500px] xl:h-[600px]">
                <Skeleton
                  width="100%"
                  height="100%"
                  borderRadius={12}
                  baseColor={skeletonBaseColor}
                  highlightColor={skeletonHighlightColor}
                />
              </div>
            </div>

            {/* Caption Input */}
            <div className="flex flex-col w-full px-1 mt-6 md:px-6 gap-y-4">
              <Skeleton
                width="100%"
                height={56}
                borderRadius={8}
                baseColor={skeletonBaseColor}
                highlightColor={skeletonHighlightColor}
              />
              <Skeleton
                width="80%"
                height={32}
                borderRadius={8}
                baseColor={skeletonBaseColor}
                highlightColor={skeletonHighlightColor}
                className="mb-4"
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-3 border-[1px] border-primary-11 bg-primary-12 rounded-r-[20px] p-6 h-fit">
            <Skeleton
              width="80%"
              height={20}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
              className="mb-3"
            />
            <div className="py-2 relative flex gap-3 overflow-x-auto">
              {Array(3).fill(null).map((_, index) => (
                <div key={index} className="w-[98px] h-[128px] flex-shrink-0">
                  <Skeleton
                    width="100%"
                    height="100%"
                    borderRadius={8}
                    baseColor={skeletonBaseColor}
                    highlightColor={skeletonHighlightColor}
                  />
                </div>
              ))}
            </div>

            <hr className="border-primary-10 my-5" />

            <Skeleton
              width="100%"
              height={20}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
            <Skeleton
              width="90%"
              height={16}
              className="mt-3 mb-2"
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
            <hr className="border-primary-10 my-5" />

            <Skeleton
              width="100%"
              height={20}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
            <Skeleton
              width="90%"
              height={16}
              className="mt-3"
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
          </div>
        </div>

        {/* Photo Gallery - Added proper spacing and fixed overlapping */}
        <div className="mt-16 mb-10 w-full">
          <Skeleton
            width={200}
            height={24}
            baseColor={skeletonBaseColor}
            highlightColor={skeletonHighlightColor}
            className="mb-6"
          />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="aspect-[3/4] w-full">
                  <Skeleton
                    height="100%"
                    width="100%"
                    baseColor={skeletonBaseColor}
                    highlightColor={skeletonHighlightColor}
                    borderRadius={12}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostLoadingSkeleton;
