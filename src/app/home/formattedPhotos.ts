import { Page, Post } from "$/types/data.types";
import { isHighQualityImage } from "@/utils";
import type { Photo } from "react-photo-album";

export interface ExtendedPhoto extends Photo {
  prompt?: string;
  author?: string;
  category?: string;
  cpu?: number;
  createdAt?: string;
  device?: string;
  isDraft?: boolean;
  isPinned?: boolean;
  isPrivate?: boolean;
  likeCount?: number;
  seed?: number;
  id: string;
  caption?: string;
}

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

// Function to fetch the image
export const getImage = (
  cidOrUrl: string | undefined,
  fileName: string,
  author: string
) => {
  try {
    if (!cidOrUrl) {
      //console.warn("getImage called with an undefined or empty cidOrUrl");
      return "/fallback.jpg"; // Handle missing value gracefully
    }

    const isDev = process.env.NODE_ENV === "development";
    const isLighthouseCID = !cidOrUrl?.startsWith("http"); // Use optional chaining

    let imageOptions = "";
    if (isLighthouseCID && isHighQualityImage(fileName)) {
      imageOptions += "?h=300&w=300";
    }

    // In dev mode, use R2.dev for Cloudflare images, but keep Lighthouse CID-based URLs
    if (isDev) {
      return isLighthouseCID
        ? process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY +
            cidOrUrl +
            "/" +
            fileName +
            imageOptions
        : `${process.env.NEXT_PUBLIC_CF_URL}/${author}/${fileName}`;
    }

    // In production, return the stored URL as-is
    return isLighthouseCID
      ? process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY +
          cidOrUrl +
          "/" +
          fileName +
          imageOptions
      : `${process.env.NEXT_PUBLIC_CF_URL}/${author}/${fileName}`; //cidOrUrl; //TODO: Correctly return the Cloudflare URL which is cidOrUrl
  } catch (error) {
    console.error("Error fetching image:", error);
    return "/fallback.jpg"; // Fallback if there's an error
  }
};

// export const getImage = (cid: string, fileName: string) => {
//   try {
//     let imageOptions = "";
//     if (isHighQualityImage(fileName)) {
//       imageOptions += "?h=300&w=300";
//     }
//     return (
//       process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY +
//       cid +
//       "/" +
//       fileName +
//       imageOptions
//     );
//   } catch (error) {
//     console.error("Error fetching image:", error);
//     return "/fallback.jpg"; //TODO: Provide a fallback image if fetch fails
//   }
// };

export const formattedPhotosForGallary = (pages: Page[]): ExtendedPhoto[] => {
  return pages
    .flatMap((page) =>
      page.data.map((post: Post, index) => {
        const image = post.ipfsImages?.[0]; // Assuming only one image per post

        if (!image || !image.hash || !image.fileNames?.[0]) return null;

        const assetHash = image.hash;
        const fileName = image.fileNames[0];

        const imageUrl = getImage(assetHash, fileName, post.author);

        const height = 1080 * (index % 4 === 0 ? 2 : 1);

        return {
          id: post.id.toString(),
          src: imageUrl,
          key: post.id.toString(),
          alt: post.prompt,
          width: 1080,
          height: height, // Adjust based on actual aspect ratio
          srcSet: breakpoints.map((breakpoint) => ({
            src: getImage(assetHash, fileName, post.author), // Ensure consistent source
            width: breakpoint,
            height: Math.round((height / 1080) * breakpoint), // Maintain aspect ratio
          })),
          prompt: post.prompt,
          author: post.author,
          category: post.category,
          cpu: post.cpu,
          createdAt: post.createdAt,
          device: post.device,
          isDraft: post.isDraft,
          isPinned: post.isPinned,
          isPrivate: post.isPrivate,
          caption: post.caption,
          seed: post.seed,
        } as ExtendedPhoto;
      })
    )
    .filter(Boolean) as ExtendedPhoto[];
};

export const formattedPhotosForGrid = (pages: Page[]): ExtendedPhoto[] => {
  return pages
    .flatMap((page) =>
      page.data.map((post: Post) => {
        const image = post.ipfsImages?.[0]; // Assuming only one image per post

        if (!image || !image.hash || !image.fileNames?.[0]) return null;

        const assetHash = image.hash;
        const fileName = image.fileNames[0];

        const imageUrl = getImage(assetHash, fileName, post.author);

        return {
          id: post.id.toString(),
          src: imageUrl,
          key: post.id.toString(),
          alt: post.prompt,
          width: 1080,
          height: 1080, // Adjust based on actual aspect ratio
          srcSet: breakpoints.map((breakpoint) => ({
            src: getImage(assetHash, fileName, post.author), // Ensure consistent source
            width: breakpoint,
            height: 1080 * breakpoint, // Maintain aspect ratio
          })),
          prompt: post.prompt,
          author: post.author,
          category: post.category,
          cpu: post.cpu,
          createdAt: post.createdAt,
          device: post.device,
          isDraft: post.isDraft,
          isPinned: post.isPinned,
          isPrivate: post.isPrivate,
          caption: post.caption,
          seed: post.seed,
        } as ExtendedPhoto;
      })
    )
    .filter(Boolean) as ExtendedPhoto[];
};

export const formattedPhotos = (pages: Page[]): ExtendedPhoto[] => {
  return pages
    .flatMap((page) =>
      page.data.map((post: Post) => {
        const image = post.ipfsImages?.[0]; // Assuming only one image per post
        console.log(post.author);
        if (!image || !image.hash || !image.fileNames?.[0]) return null;

        const assetHash = image.hash;
        const fileName = image.fileNames[0];

        const imageUrl = getImage(
          assetHash,
          fileName,
          "e260b0ab-9867-4507-97be-976779c20c9f"
        );

        return {
          id: post.id.toString(),
          src: imageUrl,
          key: post.id.toString(),
          alt: post.prompt,
          width: 1080,
          height: 720, // Adjust based on actual aspect ratio
          srcSet: breakpoints.map((breakpoint) => ({
            src: getImage(assetHash, fileName, post.author), // Ensure consistent source
            width: breakpoint,
            height: Math.round((720 / 1080) * breakpoint), // Maintain aspect ratio
          })),
          prompt: post.prompt,
          author: post.author,
          category: post.category,
          cpu: post.cpu,
          createdAt: post.createdAt,
          device: post.device,
          isDraft: post.isDraft,
          isPinned: post.isPinned,
          isPrivate: post.isPrivate,
          caption: post.caption,
          seed: post.seed,
        } as ExtendedPhoto;
      })
    )
    .filter(Boolean) as ExtendedPhoto[];
};
