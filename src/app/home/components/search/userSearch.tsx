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

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-4">
        Error loading results: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div>
      {data?.pages?.flatMap((page) =>
        (page.data || []).map((details: ProfileWithPosts) => (
          <User key={details.id} data={details} posts={details.posts || []} />
        )),
      ) || (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <p className="text-center text-lg">
            No results found for "{searchTerm}"
          </p>
          <p className="text-center text-sm mt-2 text-gray-500">
            Try different keywords or check your spelling
          </p>
        </div>
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
  const { data: isFollowing, isLoading: isFollowLoading } = useDoesUserFollow(
    userId || "", // Provide default empty string instead of casting
    data.id,
  );
  const toggleFollowMutation = useToggleFollow();

  const handleFollowToggle = () => {
    if (!userId) return; // Guard against undefined userId

    toggleFollowMutation.mutate({
      followerId: userId,
      followeeId: data.id,
    });
  };

  return (
    <div className="bg-primary-11 rounded-t-3xl my-3">
      <div className="flex justify-between items-center h-16 py-4 px-4">
        <div className="flex items-center gap-4">
          <Link
            href={data.id ? `/home/profile/${data.id}` : "#"}
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
            href={data.id ? `/home/profile/${data.id}` : "#"}
            className="text-primary-1 text-lg w-36 font-normal"
          >
            {data.username || "Unknown user"}
          </Link>

          {userId && userId !== data.id && (
            <button
              disabled={toggleFollowMutation.isPending || isFollowLoading}
              onClick={handleFollowToggle}
              className={`flex items-center justify-center gap-1 rounded-full h-8 w-24 px-2 py-1 border-[1px] border-primary-8
                ${isFollowing ? "bg-transparent" : "bg-primary-10"}`}
            >
              <p className="text-primary-5 text-sm">
                {isFollowLoading
                  ? "Loading..."
                  : isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </p>
            </button>
          )}
        </div>

        <div className="flex gap-x-4 my-4">
          <ProfileInfo
            value={(followStats?.followeeCount || 0).toString()}
            title={followStats?.followeeCount === 1 ? "Follower" : "Followers"}
          />
          <ProfileInfo
            value={(followStats?.followerCount || 0).toString()}
            title="Following"
            leftBorder={true}
          />
          <ProfileInfo
            value={(likeCount || 0).toString()}
            title={(likeCount || 0) === 1 ? "Like" : "Likes"}
            leftBorder={true}
          />
        </div>
      </div>

      <div className="overflow-x-auto whitespace-nowrap">
        {posts && posts.length > 0 ? (
          posts.map((post, index) => (
            <UserImage key={post.id || index} post={post} />
          ))
        ) : (
          <div className="p-4 text-center text-primary-5">
            No posts to display
          </div>
        )}
      </div>
    </div>
  );
}

export function UserImage({ post }: { post: Post }) {
  // Default values to avoid errors
  const imageHash = post.ipfsImages?.[0]?.hash || "";
  const imageFileName = post.ipfsImages?.[0]?.fileNames?.[0] || "";
  const author = post.author || "";
  const caption = post.caption || post.prompt || "No caption";

  // Only try to get image if we have the required data
  const imageSrc =
    imageHash && imageFileName && author
      ? getImage(imageHash, imageFileName, author)
      : "/placeholder-image.jpg"; // Fallback image

  return (
    <Link
      href={`/home/photo/${post.id}`}
      className="relative inline-block w-[306px] cursor-pointer"
    >
      <div className="absolute top-0 flex justify-between text-primary-1 text-sm picture-gradient w-full h-12 items-center px-3">
        <p>{post.createdAt ? timeAgo(post.createdAt) : "Unknown time"}</p>
        <button>
          <OptionMenuIcon color="#FFFFFF" />
        </button>
      </div>

      <Image
        src={imageSrc}
        width={306}
        height={408}
        alt={caption.slice(0, 50)}
        onError={(e) => {
          // Fallback for image loading errors
          const target = e.target as HTMLImageElement;
          target.src = "/placeholder-image.jpg";
        }}
      />

      <p className="absolute bottom-0 left-0 w-full text-left text-primary-1 text-sm picture-gradient h-14 p-3">
        {truncateText(caption, 3)}
      </p>
    </Link>
  );
}
