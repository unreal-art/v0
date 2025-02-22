"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import { FlashIcon, ShareModernIcon } from "@/app/components/icons";
import ProfileInfo from "./profileInfo";
import { supabase } from "$/supabase/client";
import { useFollowStats } from "@/hooks/useFollowStats";
import { getUser } from "$/queries/user";
import { useLikeStat } from "@/hooks/useLikeStat";
// import { getUser } from "$/queries/user/getUser";

export default function UserData() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(supabase),
  });

  const userId = user?.user?.id;

  //fetch follow stats
  const { data: followStats } = useFollowStats(userId);

  //fetch like stat
  const { data: likeCount } = useLikeStat(userId);

  if (isLoading) return <p>Loading user data...</p>;
  if (error) return <p>Error loading user data.</p>;

  return (
    <div className="flex flex-col md:flex-row pt-5 w-full mb-12 gap-4">
      <div className="flex gap-4">
        <div className="w-28 h-28 md:w-52 md:h-52">
          <Image
            className="rounded-full"
            src={user?.user.user_metadata.avatar_url}
            width={200}
            height={200}
            alt="profile"
          />
        </div>

        <div className="block md:hidden">
          <p className="text-3xl font-medium">
            {user?.user.user_metadata.full_name}
          </p>

          <div className="flex my-4 gap-3">
            <button className="flex justify-center items-center h-9 w-28 text-primary-4 font-medium text-sm topup-btn-gradient rounded-2xl bg-primary-11">
              <p className="text-sm">Edit Account</p>
            </button>

            <button className="flex justify-center items-center h-9 w-12 text-primary-4 font-medium text-sm topup-btn-gradient rounded-2xl bg-primary-11">
              <ShareModernIcon width={16} height={16} color="#DADADA" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow text-primary-5">
        <div className="hidden md:block">
          <p className="text-3xl font-medium">
            {user?.user.user_metadata.full_name}
          </p>

          <div className="flex my-4 gap-3">
            <button className="flex justify-center items-center h-9 w-28 text-primary-4 font-medium text-sm topup-btn-gradient rounded-2xl bg-primary-11">
              <p className="text-sm">Edit Account</p>
            </button>

            <button className="flex justify-center items-center h-9 w-12 text-primary-4 font-medium text-sm topup-btn-gradient rounded-2xl bg-primary-11">
              <ShareModernIcon width={16} height={16} color="#DADADA" />
            </button>
          </div>
        </div>

        <div className="flex gap-x-4 my-4">
          <ProfileInfo
            value={followStats?.followeeCount?.toString() || "0"}
            title={followStats?.followeeCount === 1 ? "Follower" : "Followers"} // Adjusts title dynamically
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

        <p className="text-primary-7 my-4"> Bio </p>
        <p className="text-primary-7 my-4"> {user?.bio} </p>
      </div>

      <div className="hidden md:block">
        <button className="flex gap-2 text-primary-4 font-medium text-sm topup-btn-gradient p-3 rounded-md bg-primary-11">
          <div>
            <FlashIcon width={16} height={16} color="#DADADA" />
          </div>
          <p>10 Credits</p>
        </button>
      </div>
    </div>
  );
}
