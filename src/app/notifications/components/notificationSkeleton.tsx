import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const NotificationSkeleton = () => {
  return (
    <div className="border-primary-8 border-[1px] flex items-center bg-primary-12 h-28 my-4 rounded-[20px] p-3">
      <div className="flex gap-2 justify-between items-center w-full">
        {/* Notification Content */}
        <div className="w-[80%]">
          <Skeleton
            width={60}
            height={12}
            baseColor="#1a1a1a"
            highlightColor="#333"
          />

          <div className="flex gap-2 mt-1 w-full">
            {/* Profile Image Skeleton */}
            <div className="basis-10">
              <Skeleton
                circle
                width={36}
                height={36}
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
            </div>

            {/* Text Content */}
            <div>
              <Skeleton
                width={100}
                height={16}
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
              <Skeleton
                width={180}
                height={14}
                baseColor="#1a1a1a"
                highlightColor="#333"
              />
            </div>
          </div>
        </div>

        {/* Post Image Skeleton */}
        <div className="basis-20 flex items-center w-[20%]">
          <Skeleton
            width={70}
            height={70}
            baseColor="#1a1a1a"
            highlightColor="#333"
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationSkeleton;
