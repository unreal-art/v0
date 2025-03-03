"use client";

import Image from "next/image";

import { FlashIcon, ShareModernIcon } from "@/app/components/icons";
import ProfileInfo from "./profileInfo";
import { useFollowStats } from "@/hooks/useFollowStats";
import { useLikeStat } from "@/hooks/useLikeStat";
import { useParams } from "next/navigation";
// import { useUser } from "@/hooks/useUser";
import useUserData from "@/hooks/useUserData";
import ProfileSkeleton from "./profileSkeleton";
import { useState } from "react";
import ModalWrapper from "../../components/modals/modalWrapper";
import EditModal from "./modals/editModal";
import DeleteModal from "./modals/deleteModal";
import EditProfileModal from "./modals/editProfileModal";
import ShareModal from "../../components/modals/shareModal";
import { useUser } from "@/hooks/useUser";
// import { getUser } from "$/queries/user/getUser";

type TitleType = "Edit Account" | "Edit Profile" | "Delete Account" | "";

export default function UserData() {

  const [open, setOpen] = useState(false)
  const [openShare, setOpenShare] = useState(false)
  const [title, setTitle] = useState<TitleType>("")

  const params = useParams();

  const userId = params.id as string;
  //fetch user details
  const { data: user, isLoading } = useUserData(userId);
  const {
    userId: authUserId,
    user: authUser,
    loading: authUserLoading,
  } = useUser();

  //fetch follow stats
  const { data: followStats } = useFollowStats(userId);

  //fetch like stat
  const { data: likeCount } = useLikeStat(userId);

  if (isLoading || authUserLoading || !authUser) return <ProfileSkeleton />;
  // if (error) return <p>Error loading user data.</p>;

  const showEditAccount = () => {
    setOpen(true);
    setTitle("Edit Account");
  };

  const handleClose = () => {
    setOpen(false);
    setTitle("");
  };

  return (
    <>
      <div className="flex flex-col md:flex-row pt-5 w-full mb-12 gap-4">
        <div className="flex gap-4">
          <div className="w-28 h-28 md:w-52 md:h-52">
            <Image
              className="rounded-full"
              src={user?.avatar_url || "/profile.jpg"}
              width={200}
              height={200}
              alt="profile"
            />
          </div>

          <div className="block md:hidden">
            <p className="text-3xl font-medium">{user?.full_name}</p>

            <div className="flex my-4 gap-3">
              {authUserId === userId && (
                <button
                  onClick={showEditAccount}
                  className="flex justify-center items-center h-9 w-28 text-primary-4 font-medium text-sm topup-btn-gradient rounded-2xl bg-primary-11"
                >
                  <p className="text-sm">Edit Account</p>
                </button>
              )}

              <button className="flex justify-center items-center h-9 w-12 text-primary-4 font-medium text-sm topup-btn-gradient rounded-2xl bg-primary-11">
                <ShareModernIcon width={16} height={16} color="#DADADA" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow text-primary-5">
          <div className="hidden md:block">
            <p className="text-3xl font-medium">{user?.full_name}</p>

            <div className="flex my-4 gap-3">
              {authUserId === userId && (
                <button
                  onClick={showEditAccount}
                  className="flex justify-center items-center h-9 w-28 text-primary-4 font-medium text-sm topup-btn-gradient rounded-2xl bg-primary-11"
                >
                  <p className="text-sm">Edit Account</p>
                </button>
              )}

              <button onClick={() => setOpenShare(true)} className="flex justify-center items-center h-9 w-12 text-primary-4 font-medium text-sm topup-btn-gradient rounded-2xl bg-primary-11">
                <ShareModernIcon width={16} height={16} color="#DADADA" />
              </button>
            </div>
          </div>

          <div className="flex gap-x-4 my-4">
            <ProfileInfo
              value={followStats?.followeeCount?.toString() || "0"}
              title={
                followStats?.followeeCount === 1 ? "Follower" : "Followers"
              } // Adjusts title dynamically
            />
            <ProfileInfo
              value={followStats?.followerCount?.toString() || "0"}
              title={
                followStats?.followerCount === 1 ? "Following" : "Following"
              } // Stays the same
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
          {authUserId === userId && (
            <button className="flex gap-2 text-primary-4 font-medium text-sm topup-btn-gradient p-3 rounded-md bg-primary-11">
              <div>
                <FlashIcon width={16} height={16} color="#DADADA" />
              </div>
              <p>10 Credits</p>
            </button>
          )}
        </div>
      </div>
      <ShareModal open={openShare} setOpen={setOpenShare} link={"https://unreal.art/home/profile/" + userId} />
      <ModalWrapper
        title={title}
        open={open}
        setOpen={setOpen}
        titleColor={title === "Delete Account" ? "#FF5252" : undefined}
      >
        {title === "Edit Account" && (
          <EditModal
            openProfile={() => setTitle("Edit Profile")}
            deleteProfile={() => setTitle("Delete Account")}
          />
        )}
        {title === "Delete Account" && <DeleteModal close={handleClose} />}
        {title === "Edit Profile" && user && (
          <EditProfileModal user={authUser} close={handleClose} />
        )}
      </ModalWrapper>
    </>
  );
}
