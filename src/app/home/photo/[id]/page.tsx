"use client";
import React, { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import GenerateInput from "../../components/generateInput";
import dynamic from "next/dynamic";
import Image from "next/image";
import Prompt from "../components/prompt";
import Feature from "../components/feature";
import CaptionInput from "../components/captionInput";
import Interactions from "../components/interactions";
import PostingActions from "../components/postingActions";
import { BackIcon, OptionMenuIcon } from "@/app/components/icons";
import { usePost, useUpdatePost, prefetchPost } from "@/hooks/usePost";
import { useUser } from "@/hooks/useUser";
import useAuthorImage from "@/hooks/useAuthorImage";
import useAuthorUsername from "@/hooks/useAuthorUserName";
import { getImage } from "../../formattedPhotos";
import { UploadResponse } from "$/types/data.types";
import {
  formatDate,
  formatDisplayName,
  getImageResolution,
  truncateText,
} from "@/utils";
import { useEffect, useState, useCallback } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import ViewSkeleton from "../components/viewSkeleton";
import Link from "next/link";
// Head is not needed in App Router
import { toast } from "sonner";
import ImageOptionMenu from "../../components/imageOptionMenu";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";
import { IPhoto } from "@/app/libs/interfaces";
import OptimizedImage from "@/app/components/OptimizedImage";
import { Following } from "../../components/followingBtn";
import { ErrorBoundary } from "@/app/components/errorBoundary";

const PhotoGallaryTwo = dynamic(
  () => import("../../components/photoGallaryTwo"),
  {
    ssr: false,
  }
);

// Component that uses useSearchParams wrapped in Suspense
function GenerationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const a = searchParams.get("a");
  const { id } = useParams();

  const queryClient = useQueryClient();

  // Ensure id is valid before making API call
  const postId = id ? parseInt(id as string) : null;

  const {
    data: post,
    isLoading: loadingPost,
    error: postError,
    updatePostOptimistically,
  } = usePost(postId);

  const {
    updatePost,
    // loading: updatingPost,
    // error: updateError,
  } = useUpdatePost();
  const { userId, loading: loadingUser } = useUser();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { data: authorImage } = useAuthorImage(post?.author);
  const { data: authorUsername } = useAuthorUsername(post?.author);
  const [caption, setCaption] = useState(post?.caption || "");
  const [privatePost, setPrivatePost] = useState(post?.isPrivate);
  const [isFetching, setIsFetching] = useState(true);
  const [dynamicTitle, setDynamicTitle] = useState("Default Title");
  const [dynamicDescription, setDynamicDescription] = useState(
    "Default Description"
  );
  const [commentPhoto, setCommentPhoto] = useState<IPhoto | boolean>(false);
  const [dynamicImage, setDynamicImage] = useState("/default-image.jpg");

  useEffect(() => {
    if (!loadingUser && !loadingPost && post) {
      setIsFetching(false); // Only set false when loading completes
    }
  }, [loadingUser, loadingPost, post]);

  useEffect(() => {
    // Example: Fetch data dynamically
    const fetchData = async () => {
      // Simulate API response
      const data = {
        title: post?.caption || truncateText(post?.prompt, 10),
        description: truncateText(post?.prompt, 100),
        image: getImage(
          (post?.ipfsImages as UploadResponse[])?.[0]?.hash,
          (post?.ipfsImages as UploadResponse[])?.[0]?.fileNames[0],
          post?.author as string
        ),
      };

      setDynamicTitle(data.title);
      setDynamicDescription(data.description);
      setDynamicImage(data.image);
      setCommentPhoto({
        id: String(post?.id),
        src: data.image,
        author: post?.author,
      });
    };

    fetchData();
  }, [post]);

  // Sync state with post.isPrivate whenever post changes
  useEffect(() => {
    setPrivatePost(post?.isPrivate);
    setCaption(post?.caption || "");
  }, [post]);

  useEffect(() => {
    // Redirect if there's an error (meaning no post to display)
    if (postError) {
      router.replace("/home");
      return;
    }

    // If `a` is true, only the owner should see the post
    if (a && userId && post && post.author !== userId) {
      router.replace("/home");
    }
  }, [a, userId, post?.author, postError, router]);

  // Prefetch related posts by the same author
  useEffect(() => {
    if (post?.author && postId !== null) {
      // This is a placeholder - you would need to implement a function to get other posts by author
      const fetchRelatedPosts = async () => {
        try {
          const { data: otherPosts } = await supabase
            .from("posts")
            .select("id")
            .eq("author", post.author)
            .neq("id", postId)
            .limit(5);

          // Prefetch the first few posts by the same author
          otherPosts?.forEach((relatedPost: { id: number }) => {
            prefetchPost(queryClient, relatedPost.id);
          });
        } catch (error) {
          console.error("Error prefetching related posts:", error);
        }
      };

      fetchRelatedPosts();
    }
  }, [post?.author, postId, queryClient]);

  //save post as draft with optimistic updates
  const saveAsDraft = async () => {
    if (!post?.id) return;

    const data = {
      caption,
      isPrivate: privatePost,
      isDraft: true,
    };

    // Optimistically update the UI
    updatePostOptimistically(data);

    try {
      const success = await updatePost(post.id, data);
      if (success) {
        toast("Post saved to draft");
      } else {
        toast.error("Failed to save post to draft");
      }
    } catch (error) {
      toast.error(`Error saving draft: ${(error as Error).message}`);
    }
  };

  //post image to db with optimistic updates
  const postImage = async () => {
    if (!post?.id) return;

    const data = {
      caption,
      isPrivate: privatePost,
      isDraft: false,
    };

    // Optimistically update the UI
    updatePostOptimistically(data);

    try {
      const success = await updatePost(post.id, data);
      if (success) {
        toast.success("Post published successfully!");
        //redirect to post page
        router.replace(`/home/creations?s=public`);
      } else {
        toast.error("Failed to publish post");
      }
    } catch (error) {
      toast.error(`Error publishing post: ${(error as Error).message}`);
    }
  };

  if (isFetching) {
    return <ViewSkeleton />;
  }

  // Get the selected image or default to the first one
  const mainImage = getImage(
    (post?.ipfsImages as UploadResponse[])?.[selectedImageIndex]?.hash,
    (post?.ipfsImages as UploadResponse[])?.[selectedImageIndex]?.fileNames[0],
    post?.author as string
  );

  return (
    <div className="w-full">
      <div className="hidden md:flex flex-col justify-center items-center pt-5 w-full">
        <GenerateInput />
      </div>

      <div className="flex gap-x-2 items-center w-full h-10 mt-8 md:mt-0 mb-2">
        <button
          className="flex gap-x-1 items-center text-sm"
          onClick={() => router.back()}
        >
          <BackIcon width={16} height={16} color="#5D5D5D" />
          <p>Back</p>
        </button>
      </div>

      <div className="overflow-y-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 w-full">
          {/* Main Content Column */}
          <div className="flex flex-col justify-between items-center col-span-9">
            <div className="flex justify-between h-24 p-6 gap-5 w-full">
              <Link
                href={post?.author ? `/home/profile/${post?.author}` : "#"}
                className="flex gap-1"
              >
                <div>
                  {authorImage ? (
                    <OptimizedImage
                      className="rounded-full drop-shadow-lg"
                      src={authorImage}
                      width={48}
                      height={48}
                      alt={`${authorUsername}'s profile`}
                      isProfile={true}
                      trackPerformance={true}
                      imageName={`profile-${post?.author}`}
                      username={authorUsername || ""}
                      isAvatar={true}
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg leading-6 text-primary-2">
                    {authorUsername && formatDisplayName(authorUsername)}
                  </p>
                  <p className="text-primary-7 nasalization">Creator</p>
                </div>
              </Link>

              {post && post.author && <Following authorId={post?.author} />}
            </div>

            <div className="flex justify-center w-full relative">
              <ErrorBoundary
                fallback={
                  <div className="w-[306px] h-[408px] sm:w-[350px] sm:h-[450px] md:w-[400px] md:h-[500px] lg:w-[450px] lg:h-[550px] xl:w-[500px] xl:h-[600px] flex items-center justify-center bg-primary-13 rounded-lg">
                    <p className="text-primary-3">Unable to load image</p>
                  </div>
                }
              >
                <div className="relative w-[306px] h-[408px] sm:w-[350px] sm:h-[450px] md:w-[400px] md:h-[500px] lg:w-[450px] lg:h-[550px] xl:w-[500px] xl:h-[600px]">
                  <OptimizedImage
                    className="object-contain w-full h-full"
                    src={mainImage}
                    width={0}
                    height={0}
                    alt={`unreal-image-${
                      (post?.ipfsImages as UploadResponse[])?.[0]?.fileNames[0]
                    }`}
                    priority={true}
                    loading="eager"
                    trackPerformance={true}
                    imageName={`view-${
                      (post?.ipfsImages as UploadResponse[])?.[0]?.fileNames[0]
                    }`}
                  />
                </div>
              </ErrorBoundary>
            </div>

            <div className="flex flex-col w-full px-1 mt-8 md:mt-0 md:px-6 gap-y-4">
              <CaptionInput
                caption={caption as string}
                setCaption={setCaption}
                readOnly={userId !== post?.author}
              />
              {post && (
                <Interactions
                  postId={post?.id as number}
                  postDetails={commentPhoto as IPhoto}
                  selectedImageIndex={selectedImageIndex}
                />
              )}
              {post && userId == post?.author && (
                <PostingActions
                  privatePost={privatePost as boolean}
                  setPrivatePost={setPrivatePost}
                  saveAsDraft={saveAsDraft}
                  postImage={postImage}
                  isDraft={post.isDraft as boolean}
                />
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="col-span-3 border-[1px] border-primary-11 bg-primary-12 rounded-r-[20px] p-6 overflow-y-auto">
            <div className="h-36">
              <p className="text-primary-5 text-lg">Output quantity</p>

              <div className="py-2 relative flex gap-2 overflow-x-auto">
                {(post?.ipfsImages as UploadResponse[])?.map((image, index) => (
                  <Image
                    key={index}
                    src={getImage(
                      image.hash,
                      image.fileNames[0],
                      post?.author as string
                    )}
                    width={98}
                    height={128}
                    alt="generated"
                    className={`hover:opacity-100 transition-opacity duration-200 cursor-pointer ${
                      selectedImageIndex == index ? "opacity-100" : "opacity-20"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            </div>

            <hr className="border-[1px] border-primary-10 my-2" />

            {/* Only creator sees the prompt */}
            {post?.author == userId && (
              <Prompt title="Prompt" fullText={post?.prompt || ""}>
                {truncateText(post?.prompt || "", 100)}
              </Prompt>
            )}

            {post?.author == userId && (
              <Prompt title="Magic Prompt" fullText={post?.prompt || ""}>
                {truncateText(post?.prompt || "", 100)}
              </Prompt>
            )}

            <div className="grid grid-cols-2 gap-6">
              <Feature title="Model" content="Dart 2.0" />
              <Feature title="Style" content="Default" />
              <ImageResolutionFeature
                imageUrl={getImage(
                  (post?.ipfsImages as UploadResponse[])?.[0]?.hash,
                  (post?.ipfsImages as UploadResponse[])?.[0]?.fileNames[0],
                  post?.author as string
                )}
              />
              <Feature title="Rendering" content="Default" />
              <Feature title="Seed" content={post?.seed?.toString() || ""} />
              <Feature
                title="Date"
                content={formatDate(post?.createdAt as string)}
              />
            </div>
          </div>
        </div>

        {/* Related Posts Section */}
        <p className="h-14 py-2 border-y-[1px] border-primary-10 text-center leading-10 my-10">
          {a ? "Drafts" : "Other posts"} by{" "}
          <Link href={post?.author ? `/home/profile/${post?.author}` : "#"}>
            <strong className="text-primary-5 pl-1">
              {authorUsername && formatDisplayName(authorUsername)}
            </strong>
          </Link>
        </p>

        <div>
          <ErrorBoundary
            fallback={
              <div className="p-8 text-center bg-primary-13 rounded-lg">
                <p className="text-primary-3 mb-4">
                  Unable to load related images
                </p>
                <button
                  className="px-4 py-2 bg-primary-5 text-white rounded-lg hover:bg-primary-6 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            }
          >
            <PhotoGallaryTwo />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

// Export the component wrapped in Suspense
export default function Generation() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <GenerationContent />
    </Suspense>
  );
}

function ImageResolutionFeature({ imageUrl }: { imageUrl: string }) {
  const [resolution, setResolution] = useState("Loading...");

  useEffect(() => {
    if (imageUrl) {
      getImageResolution(imageUrl)
        .then((res) => setResolution(res as string))
        .catch(() => setResolution("Error loading image"));
    }
  }, [imageUrl]);

  return <Feature title="Resolution" content={resolution} />;
}
