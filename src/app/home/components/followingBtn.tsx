import { useDoesUserFollow } from "@/hooks/useDoesUserFollow";
import { useUser } from "@/hooks/useUser";
import { useToggleFollow } from "@/hooks/useToggleFollow";



export function Following({authorId}: { authorId: string }) {

    const { userId } = useUser();
    const { data: isFollowing, isLoading } = useDoesUserFollow(
        userId as string,
        authorId,
    );
    const toggleFollowMutation = useToggleFollow();

    const handleFollowToggle = () => {
        toggleFollowMutation.mutate({
        followerId: userId as string,
        followeeId: authorId
        });
    };

    return (
        <div className="bg-primary-11 rounded-t-3xl my-3">

            {
                userId !== authorId && (
                    <button
                        disabled={toggleFollowMutation.isPending}
                        onClick={handleFollowToggle}
                        className={`flex items-center justify-center gap-1 rounded-full h-8 w-24 px-2 py-1 border-[1px] border-primary-8 bg-[#DADADA] text-primary-11 ${isFollowing ? "bg-transparent" : "bg-primary-10"}`}>
                        <p className="text-primary-5 text-sm">
                        {isLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
                        </p>
                    </button>
            )}

        </div>
    );
}