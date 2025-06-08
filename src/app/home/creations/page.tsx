import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "@/app/components/errorBoundary";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { createClient } from "$/supabase/server";
import {
  getIsDraftPostsByUser,
  getPinnedPostsByUser,
  getPostsByUser,
  getPrivatePostsByUser,
  getUserLikedPosts,
} from "@/queries/post/getPostsByUser";
import { Post } from "$/types/data.types";
import GenerateInput from "../components/generateInput";
import CreationView from "./components/CreationView";

export default async function Creation({
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
      <div className="flex flex-col items-center background-color-primary-1 px-1 md:px-2 lg:px-10 w-full">
        <div className="hidden md:flex flex-col justify-center items-center py-5 w-full">
          <GenerateInput />
        </div>
        <ErrorBoundary
          componentName="Creations"
          fallback={
            <div className="flex flex-col items-center justify-center w-full py-8">
              <p className="text-center text-lg text-primary-6 mb-4">Unable to load your creations</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-8 hover:bg-primary-7 text-white rounded-md transition-colors"
              >
                Reload Page
              </button>
            </div>
          }
        >
          <Suspense fallback={
            <div className="w-full max-w-7xl">
              <div className="flex justify-center gap-4 mb-6">
                {Array(5).fill(null).map((_, i) => (
                  <Skeleton key={i} width={100} height={40} baseColor="#1a1a1a" highlightColor="#333" className="rounded-md" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(12).fill(null).map((_, i) => (
                  <div className="aspect-square relative">
                    <Skeleton key={i} height="100%" width="100%" baseColor="#1a1a1a" highlightColor="#333" className="rounded-lg absolute inset-0" />
                  </div>
                ))}
              </div>
            </div>
          }>
            <CreationView />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrationBoundary>
  );
}
