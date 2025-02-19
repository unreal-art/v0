import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
// import { getPosts } from "$/queries/post/getPosts";
import { createClient } from "$/supabase/server";
import { Post } from "$/types/data.types";
import Image from "next/image";
import ProfileInfo from "./components/profileInfo";
import ProfileView from "./components/profileView";
import { FlashIcon, ShareModernIcon } from "@/app/components/icons";
import {
  getIsDraftPostsByUser,
  getPinnedPostsByUser,
  getPostsByUser,
  getPrivatePostsByUser,
  getUserLikedPosts,
} from "$/queries/post/getPostsByUser";

export default async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabaseSSR = await createClient();
  const queryClient = new QueryClient();
  const params = await searchParams;
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["creation_posts", params?.s || "public"],
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      // console.log("Prefetching page:", pageParam); // Debugging line

      let result: Post[] = [];
      if (params.s?.toUpperCase() === "PUBLIC") {
        result = await getPostsByUser(supabaseSSR, pageParam);
      } else if (params.s?.toUpperCase() === "PRIVATE") {
        result = await getPrivatePostsByUser(supabaseSSR, pageParam);
      } else if (params.s?.toUpperCase() === "LIKED") {
        result = await getUserLikedPosts(supabaseSSR, pageParam);
      } else if (params.s?.toUpperCase() === "PINNED") {
        result = await getPinnedPostsByUser(supabaseSSR, pageParam);
      } else if (params.s?.toUpperCase() === "DRAFT") {
        result = await getIsDraftPostsByUser(supabaseSSR, pageParam);
      } else {
        result = await getPostsByUser(supabaseSSR, pageParam);
      }
      return {
        data: result ?? [],
        nextCursor: result.length > 0 ? pageParam + 1 : undefined, // ✅ Handle pagination
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: { data: Post[]; nextCursor?: number }) =>
      lastPage?.nextCursor ?? undefined,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="relative flex flex-col items-center background-color-primary-1 px-1 md:px-10 w-full">
        <div className="flex flex-col md:flex-row pt-5 w-full mb-12 gap-4">
          <div className="flex gap-4">
            <div className="w-28 h-28 md:w-52 md:h-52">
              <Image
                className="rounded-full"
                src="/icons/dummy-profile.png"
                width={200}
                height={200}
                alt="profile"
              />
            </div>

            <div className="block md:hidden">
              <p className="text-3xl font-medium">David Ayegoro</p>

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
              <p className="text-3xl font-medium">David Ayegoro</p>

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
              <ProfileInfo value="25" title="Followers" />
              <ProfileInfo value="25" title="Following" leftBorder={true} />
              <ProfileInfo value="25" title="Likes" leftBorder={true} />
            </div>

            <p className="text-primary-7 my-4"> Bio </p>
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

        <ProfileView />
      </div>
    </HydrationBoundary>
  );
}
