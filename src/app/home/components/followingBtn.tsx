"use client";
import { useDoesUserFollow } from "@/hooks/useDoesUserFollow";
import { useUser } from "@/hooks/useUser";
import { useToggleFollow } from "@/hooks/useToggleFollow";
import { MenuItem } from "@/app/menu";
import { UserAddIcon, UserIcon } from "@/app/components/icons";

export function Following({
  authorId,
  isList,
}: {
  authorId: string;
  isList?: boolean;
}) {
  const { userId } = useUser();
  const { data: isFollowing, isLoading } = useDoesUserFollow(
    userId as string,
    authorId,
  );
  const toggleFollowMutation = useToggleFollow();

  const handleFollowToggle = () => {
    if (toggleFollowMutation.isPending) return;

    toggleFollowMutation.mutate({
      followerId: userId as string,
      followeeId: authorId,
    });
  };

  if (isList && userId !== authorId) {
    return (
      <MenuItem
        onClick={handleFollowToggle}
        icon={<UserAddIcon width={16} height={18} color="#8F8F8F" />}
        text={isFollowing ? "Unfollow" : "Follow"}
        underlineOff={true}
      />
    );
  }
  return (
    <div className=" rounded-t-3xl my-3">
      {userId !== authorId && (
        <button
          disabled={toggleFollowMutation.isPending}
          onClick={handleFollowToggle}
          className={`flex items-center justify-center gap-1 rounded-full h-8 w-24 px-2 py-1 border-[1px] border-primary-8 bg-[#DADADA] text-primary-11 ${isFollowing ? "bg-transparent" : "bg-primary-10"}`}
        >
          {!isLoading && (
            <p className="text-primary-5 text-sm">
              {isFollowing ? "Unfollow" : "Follow"}
            </p>
          )}
        </button>
      )}
    </div>
  );
}
