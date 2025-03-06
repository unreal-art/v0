import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
// import { getPosts } from "$/queries/post/getPosts";
import { createClient } from "$/supabase/server";
import { Post } from "$/types/data.types";
import ProfileView from "../components/profileView";
import {
  getIsDraftPostsByUser,
  getPinnedPostsByUser,
  getPostsByUser,
  getPrivatePostsByUser,
  getUserLikedPosts,
} from "@/queries/post/getPostsByUser";
import { getUser } from "$/queries/user";
import UserData from "../components/userData";
import { Metadata } from "next";
import useUserData from "@/hooks/useUserData";
import { getUserById } from "@/queries/user/getUserById";
import dynamic from "next/dynamic";

type Props = {
  params: { slug: string }; // Example if using dynamic routes
  searchParams: { [key: string]: string | undefined };
};

// Optimize metadata generation
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabaseSSR = await createClient();
  const data = await getUserById(params.id, supabaseSSR);

  const metadata = {
    title: "Unreal Profile",
    description: `A great creator called ${data?.username || data?.full_name}.`,
    url: `https://unreal.art/home/profile/${params.id}`,
    images: data?.avatar_url || "",
  };

  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      type: "website",
      url: metadata.url,
      title: metadata.title,
      description: metadata.description,
      images: [
        {
          url: metadata.images,
          width: 1200,
          height: 630,
          alt: `Image for ${params.id}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: [metadata.images],
    },
  };
}

export default async function Profile({
  searchParams,
  params,
}: {
  searchParams: { [key: string]: string | undefined };
  params: { id: string };
}) {
  const supabaseSSR = await createClient();
  const queryClient = new QueryClient();

  // Prefetch only the first page of data initially
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["creation_posts", searchParams?.s || "public"],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getInitialPosts(
        supabaseSSR,
        pageParam,
        params.id,
        searchParams?.s
      );
      return {
        data: result ?? [],
        nextCursor: result.length > 0 ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: { data: Post[]; nextCursor?: number }) =>
      lastPage?.nextCursor ?? undefined,
    pages: 1, // Only prefetch first page
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="relative flex flex-col items-center background-color-primary-1 px-1 md:px-10 w-full">
        <UserData />
        <ProfileView />
      </div>
    </HydrationBoundary>
  );
}

// Separate function to handle initial post fetching logic
async function getInitialPosts(
  supabase: any,
  pageParam: number,
  userId: string,
  type?: string
) {
  switch (type?.toUpperCase()) {
    case "PUBLIC":
      return await getPostsByUser(supabase, pageParam, userId);
    case "PRIVATE":
      return await getPrivatePostsByUser(supabase, pageParam, userId);
    case "LIKED":
      return await getUserLikedPosts(supabase, pageParam, userId);
    case "PINNED":
      return await getPinnedPostsByUser(supabase, pageParam, userId);
    case "DRAFT":
      return await getIsDraftPostsByUser(supabase, pageParam, userId);
    default:
      return await getPostsByUser(supabase, pageParam, userId);
  }
}
