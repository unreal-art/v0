"use client";
import Image from "next/image";
//import PhotoOverlay from "../photoOverlay"
import { OptionMenuIcon } from "@/app/components/icons";
import { timeAgo } from "@/app/libs/timeAgo";
import { truncateText } from "@/utils";
import ProfileInfo from "../../profile/components/profileInfo";
import { useSearchUsersInfinite } from "@/hooks/useSearchUsersInfinite";
import { ProfileWithPosts } from "@/queries/post/searchUsersPaginated";
import { Post } from "$/types/data.types";
import { getImage } from "../../formattedPhotos";
import { useFollowStats } from "@/hooks/useFollowStats";
import { useLikeStat } from "@/hooks/useLikeStat";
import { useDoesUserFollow } from "@/hooks/useDoesUserFollow";
import { useUser } from "@/hooks/useUser";
import { useToggleFollow } from "@/hooks/useToggleFollow";
import Link from "next/link";

const dummydata = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function UserSearch({ searchTerm }: { searchTerm: string }) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchUsersInfinite(searchTerm, 10);

  return (
    <div>
      {data?.pages?.flatMap((page) =>
        page.data.map((details: ProfileWithPosts) => (
          <User key={details.id} data={details} posts={details.posts} />
        )),
      )}
    </div>
  );
}

export function User({
  data,
  posts,
}: {
  data: ProfileWithPosts;
  posts: Post[];
}) {
  const { data: followStats } = useFollowStats(data.id);
  const { data: likeCount } = useLikeStat(data.id);
  const { userId } = useUser();
  const { data: isFollowing, isLoading } = useDoesUserFollow(
    userId as string,
    data.id,
  );
  const toggleFollowMutation = useToggleFollow();

  const handleFollowToggle = () => {
    toggleFollowMutation.mutate({
      followerId: userId as string,
      followeeId: data.id,
    });
  };

  return (
    <div className="bg-primary-11 rounded-t-3xl my-3">
      <div className="flex justify-between items-center h-16 py-4 px-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/home/profile/${data.id}`}
            className="w-10 h-10 bg-primary-9 rounded-full"
          >
            <Image
              src={data.avatar_url || "/profile.jpg"}
              width={40}
              height={40}
              alt="profile"
              className="rounded-full"
            />
          </Link>

          <Link
            href={`/home/profile/${data.id}`}
            className="text-primary-1 text-lg w-36 font-normal"
          >
            {data.username}
          </Link>

          {userId !== data.id && (
            <button
              disabled={toggleFollowMutation.isPending}
              onClick={handleFollowToggle}
              className={`flex items-center justify-center gap-1 rounded-full h-8 w-24 px-2 py-1 border-[1px] border-primary-8
    ${isFollowing ? "bg-transparent" : "bg-primary-10"}`}
            >
              <p className="text-primary-5 text-sm">
                {isLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
              </p>
            </button>
          )}
        </div>

        <div className="flex gap-x-4 my-4">
          <ProfileInfo
            value={followStats?.followeeCount?.toString() || "0"}
            title={followStats?.followeeCount === 1 ? "Follower" : "Followers"}
          />
          <ProfileInfo
            value={followStats?.followerCount?.toString() || "0"}
            title={followStats?.followerCount === 1 ? "Following" : "Following"} // Stays the same
            leftBorder={true}
          />
          <ProfileInfo
            value={likeCount?.toString() || "0"}
            title={likeCount === 1 ? "Like" : "Likes"} // Adjusts title dynamically
            leftBorder={true}
          />
        </div>
      </div>

      <div className="overflow-x-auto whitespace-nowrap">
        {posts.map((post, index) => (
          <UserImage key={index} post={post} />
        ))}
      </div>
    </div>
  );
}

export function UserImage({ post }: { post: Post }) {
  return (
    // <PhotoOverlay
    //     //setImageIndex={() => handleImageIndex(context)}
    //     //context={context as ExtendedRenderPhotoContext}
    //     >
    <Link
      href={`home/photo/${post.id}`}
      className="relative inline-block w-[306px] cursor-pointer"
    >
      <div className="absolute top-0 flex justify-between text-primary-1 text-sm picture-gradient w-full h-12 items-center px-3">
        <p>{timeAgo(post.createdAt)}</p>
        <button>
          <OptionMenuIcon color="#FFFFFF" />
        </button>
      </div>

      <Image
        src={getImage(
          post.ipfsImages?.[0].hash as string,
          post.ipfsImages?.[0].fileNames?.[0] as string,
        )}
        width={306}
        height={408}
        alt="generated"
      />

      <p className="absolute bottom-0 left-0 w-full text-left text-primary-1 text-sm picture-gradient h-14 p-3">
        {truncateText(post.caption || (post.prompt as string), 3)}
      </p>
    </Link>
    // </PhotoOverlay>
  );
}
