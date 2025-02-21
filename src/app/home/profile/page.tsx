import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
// import { getPosts } from "$/queries/post/getPosts";
import { createClient } from "$/supabase/server";
import { Post } from "$/types/data.types";
import ProfileView from "./components/profileView";
import {
  getIsDraftPostsByUser,
  getPinnedPostsByUser,
  getPostsByUser,
  getPrivatePostsByUser,
  getUserLikedPosts,
} from "@/queries/post/getPostsByUser";
import { getUser } from "$/queries/user";
import UserData from "./components/userData";

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

  //from server
  await queryClient.prefetchQuery({
    queryKey: ["user"],
    queryFn: async () => await getUser(),
  });

  // const userData = queryClient.getQueryData(["user"]);
  // console.log(userData);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="relative flex flex-col items-center background-color-primary-1 px-1 md:px-10 w-full">
        <UserData />

        <ProfileView />
      </div>
    </HydrationBoundary>
  );
}
