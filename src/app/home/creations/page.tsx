import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { createClient } from "$/supabase/server";
import { getPostsByUser } from "$/queries/post/getPostsByUser";
import { Post } from "$/types/data.types";
import GenerateInput from "../components/generateInput";
import CreationView from "./components/CreationView";




export default async function Creation() {
  const supabaseSSR = await createClient();
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["creation_posts"],
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      // console.log("Prefetching page:", pageParam); // Debugging line

      const result = await getPostsByUser(supabaseSSR, pageParam);
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
      <div className="flex flex-col items-center background-color-primary-1 px-10 w-full">
  
        <div className="hidden md:flex flex-col justify-center items-center py-5 w-full">

          <GenerateInput />

        </div>

      <CreationView />

    </div>

    </HydrationBoundary>
  );
}
