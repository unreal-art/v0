"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
//import PhotoOverlay from "../photoOverlay"
import { OptionMenuIcon } from "@/app/components/icons";
import { timeAgo } from "@/app/libs/timeAgo";
import { formatDisplayName, truncateText } from "@/utils";
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
import OptimizedImage from "@/app/components/OptimizedImage";

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
  
  // Reference for intersection observer
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // Implement infinite scroll using Intersection Observer
  useEffect(() => {
    // Don't observe if there's no more data or we're already fetching
    if (!hasNextPage || isFetchingNextPage) return;
    
    const observer = new IntersectionObserver(entries => {
      // If the loader is visible and we have more pages to fetch
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { threshold: 0.5 }); // Trigger when loader is 50% visible
    
    // Start observing the loader element
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array(3).fill(null).map((_, index) => (
          <div key={index} className="bg-primary-11 rounded-t-3xl p-4 animate-pulse">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-10 rounded-full" />
                <div className="w-36 h-5 bg-primary-10 rounded-md" />
              </div>
              <div className="flex gap-x-4">
                <div className="w-16 h-8 bg-primary-10 rounded-md" />
                <div className="w-16 h-8 bg-primary-10 rounded-md" />
                <div className="w-16 h-8 bg-primary-10 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-red-900/20 text-red-100 mx-auto my-4 max-w-lg">
        <p className="font-medium">Error loading results</p>
        <p className="text-sm opacity-80 mt-1">
          {error?.message || "Unknown error. Please try again later."}
        </p>
      </div>
    );
  }
  
  // Check if we have any results
  const hasResults = data?.pages?.some(page => page.data?.length > 0);
  
  if (!hasResults && !isLoading && searchTerm.trim() !== '') {
    return (
      <div className="flex flex-col items-center justify-center w-full p-8">
        <p className="text-center text-lg">
          No results found for "{searchTerm}"
        </p>
        <p className="text-center text-sm mt-2 text-gray-500">
          Try different keywords or check your spelling
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.pages?.flatMap((page) =>
        (page.data || []).map((details: ProfileWithPosts) => (
          <User key={details.id} data={details} posts={details.posts || []} />
        ))
      )}
      
      {/* Loader for infinite scrolling */}
      {(hasNextPage || isFetchingNextPage) && (
        <div 
          ref={loaderRef} 
          className="py-4 flex justify-center"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-primary-5 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-4 h-4 rounded-full bg-primary-5 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-4 h-4 rounded-full bg-primary-5 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <button 
              onClick={() => fetchNextPage()} 
              className="px-4 py-2 text-sm bg-primary-10 hover:bg-primary-9 text-primary-2 rounded-lg transition-colors"
              disabled={!hasNextPage || isFetchingNextPage}
            >
              Load more results
            </button>
          )}
        </div>
      )}
      
      {/* Show message when all results have been loaded */}
      {!hasNextPage && (data?.pages?.length ?? 0) > 0 && hasResults && (
        <p className="text-center text-sm text-primary-5 py-2">
          All results loaded
        </p>
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
    data.id
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
          <Link href={data.id ? `/home/profile/${data.id}` : "#"}>
            {/* <Image
              src={data.avatar_url || "/profile.jpg"}
              width={40}
              height={40}
              alt="profile"
              className="rounded-full"
            /> */}

            {data.avatar_url ? (
              <OptimizedImage
                className="rounded-full drop-shadow-lg"
                src={data.avatar_url}
                width={24}
                height={24}
                alt={`${data.username}'s profile picture`}
                trackPerformance={true}
                imageName={`profile-${data.id}`}
                username={data.username || ""}
                isAvatar={true}
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full" /> // Fallback avatar
            )}
          </Link>

          <Link
            href={data.id ? `/home/profile/${data.id}` : "#"}
            className="text-primary-1 text-lg w-36 font-normal"
          >
            {formatDisplayName(data.username || "") || "Unknown user"}
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
  
  // Track loading state
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Only try to get image if we have the required data
  const imageSrc = useMemo(() => {
    return imageHash && imageFileName && author
      ? getImage(imageHash, imageFileName, author)
      : "/placeholder-image.jpg"; // Fallback image
  }, [imageHash, imageFileName, author]);

  return (
    <Link
      href={`/home/photo/${post.id}`}
      className="relative inline-block w-[306px] cursor-pointer"
    >
      <div className="absolute top-0 flex justify-between text-primary-1 text-sm picture-gradient w-full h-12 items-center px-3 z-10">
        <p>{post.createdAt ? timeAgo(post.createdAt) : "Unknown time"}</p>
        <button>
          <OptionMenuIcon color="#FFFFFF" />
        </button>
      </div>

      <div className="px-1 relative">
        {/* Show skeleton while loading */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 rounded-t-xl bg-primary-10 animate-pulse" />
        )}
        
        <OptimizedImage
          src={imageSrc}
          alt={caption}
          width={306}
          height={200}
          className={`rounded-t-xl aspect-auto object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          trackPerformance={true}
          imageName={post.id ? `userSearch-${post.id}` : ""}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
        />
        
        {/* Show error state */}
        {hasError && (
          <div className="absolute inset-0 rounded-t-xl bg-primary-11 flex items-center justify-center">
            <p className="text-primary-5 text-sm">Failed to load image</p>
          </div>
        )}
      </div>
      
      <p className="absolute bottom-0 left-0 w-full text-left text-primary-1 text-sm picture-gradient h-14 p-3">
        {truncateText(caption, 3)}
      </p>
    </Link>
  );
}
