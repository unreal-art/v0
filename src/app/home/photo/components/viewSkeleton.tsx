import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PostLoadingSkeleton = () => {
  return (
    <div className="relative flex flex-col items-center background-color-primary-1 px-1 md:px-10 w-full">
      {/* Input Section */}
      <div className="hidden md:flex flex-col justify-center items-center pt-5 w-full">
        <Skeleton
          height={48}
          width="60%"
          borderRadius={8}
          baseColor="#1a1a1a"
          highlightColor="#333"
        />
      </div>

      {/* Back Button */}
      <div className="flex gap-x-2 items-center w-full h-10 mt-8 md:mt-0 mb-2">
        <Skeleton
          width={120}
          height={20}
          borderRadius={4}
          baseColor="#1a1a1a"
          highlightColor="#333"
        />
      </div>

      {/* Main Content */}
      <div className="overflow-y-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 w-full md:h-[calc(100vh_-_220px)]">
          {/* Left Column - Post Content */}
          <div className="flex flex-col justify-between items-center col-span-9">
            {/* Profile Info */}
            <div className="flex justify-between h-24 p-6 w-full">
              <div className="flex gap-2">
                <Skeleton
                  circle
                  width={48}
                  height={48}
                  baseColor="#1a1a1a"
                  highlightColor="#333"
                />
                <div>
                  <Skeleton
                    width={120}
                    height={20}
                    baseColor="#1a1a1a"
                    highlightColor="#333"
                  />
                  <Skeleton
                    width={80}
                    height={14}
                    baseColor="#1a1a1a"
                    highlightColor="#333"
                  />
                </div>
              </div>
              <Skeleton
                width={24}
                height={24}
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
            </div>

            {/* Generated Image Placeholder */}
            <div className="flex justify-center w-full">
              <Skeleton
                width={306}
                height={408}
                borderRadius={12}
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
            </div>

            {/* Caption Input */}
            <div className="flex flex-col w-full px-1 mt-8 md:px-6 gap-y-4">
              <Skeleton
                width="100%"
                height={56}
                borderRadius={8}
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
              <Skeleton
                width="80%"
                height={32}
                borderRadius={8}
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-3 border-[1px] border-primary-11 bg-primary-12 rounded-r-[20px] p-6">
            <Skeleton
              width="80%"
              height={20}
              baseColor="#1a1a1a"
              highlightColor="#333"
            />
            <Skeleton
              width="100%"
              height={128}
              className="mt-3"
              borderRadius={12}
              baseColor="#1a1a1a"
              highlightColor="#333"
            />

            <hr className="border-primary-10 my-4" />

            <Skeleton
              width="100%"
              height={20}
              baseColor="#1a1a1a"
              highlightColor="#333"
            />
            <Skeleton
              width="90%"
              height={16}
              className="mt-2"
              baseColor="#1a1a1a"
              highlightColor="#333"
            />
            <hr className="border-primary-10 my-4" />

            <Skeleton
              width="100%"
              height={20}
              baseColor="#1a1a1a"
              highlightColor="#333"
            />
            <Skeleton
              width="90%"
              height={16}
              className="mt-2"
              baseColor="#1a1a1a"
              highlightColor="#333"
            />
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 w-full">
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <Skeleton
                key={index}
                height={200}
                baseColor="#1a1a1a"
                highlightColor="#333"
                borderRadius={12}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default PostLoadingSkeleton;
