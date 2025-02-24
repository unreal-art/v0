import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfileSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row pt-5 w-full mb-12 gap-4">
      {/* Profile Image & Buttons */}
      <div className="flex gap-4">
        <div className="w-28 h-28 md:w-52 md:h-52">
          <Skeleton
            circle
            height="100%"
            baseColor="#1a1a1a"
            highlightColor="#333"
          />
        </div>

        <div className="block md:hidden">
          <Skeleton
            width={150}
            height={32}
            baseColor="#1a1a1a"
            highlightColor="#333"
          />
          <div className="flex my-4 gap-3">
            <Skeleton
              width={112}
              height={36}
              baseColor="#1a1a1a"
              highlightColor="#333"
            />
            <Skeleton
              width={48}
              height={36}
              baseColor="#1a1a1a"
              highlightColor="#333"
            />
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="flex-grow text-primary-5">
        <div className="hidden md:block">
          <Skeleton
            width={200}
            height={32}
            baseColor="#1a1a1a"
            highlightColor="#333"
          />
          <div className="flex my-4 gap-3">
            <Skeleton
              width={112}
              height={36}
              baseColor="#1a1a1a"
              highlightColor="#333"
            />
            <Skeleton
              width={48}
              height={36}
              baseColor="#1a1a1a"
              highlightColor="#333"
            />
          </div>
        </div>

        {/* Follower, Following, Likes */}
        <div className="flex gap-x-4 my-4">
          <Skeleton
            width={80}
            height={32}
            baseColor="#1a1a1a"
            highlightColor="#333"
          />
          <Skeleton
            width={80}
            height={32}
            baseColor="#1a1a1a"
            highlightColor="#333"
          />
          <Skeleton
            width={80}
            height={32}
            baseColor="#1a1a1a"
            highlightColor="#333"
          />
        </div>

        {/* Bio Section */}
        <Skeleton
          width={50}
          height={24}
          baseColor="#1a1a1a"
          highlightColor="#333"
        />
        <Skeleton
          width="80%"
          height={18}
          count={2}
          baseColor="#1a1a1a"
          highlightColor="#333"
        />
      </div>

      {/* Credits Button */}
      <div className="hidden md:block">
        <Skeleton
          width={120}
          height={40}
          baseColor="#1a1a1a"
          highlightColor="#333"
        />
      </div>
    </div>
  );
};

export default ProfileSkeleton;
