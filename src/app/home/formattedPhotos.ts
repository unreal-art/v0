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
  author: string,
) => {
  try {
    if (!cidOrUrl) {
      //console.warn("getImage called with an undefined or empty cidOrUrl");
      return "/fallback.png"; // Handle missing value gracefully
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
      : `${process.env.NEXT_PUBLIC_CF_URL}/${author}/${fileName}`; //cidOrUrl; // fetch from Cloudflare TODO: get direct from Cloudflare
  } catch (error) {
    console.error("Error fetching image:", error);
    return "/fallback.png"; // Fallback if there's an error
  }
};

// export const formattedPhotosForGallary = (pages: Page[]): ExtendedPhoto[] => {
//   return pages
//     .flatMap((page) =>
//       page.data.map((post: Post, index) => {
//         const image = post.ipfsImages?.[0]; // Assuming only one image per post

//         if (!image || !image.hash || !image.fileNames?.[0]) return null;

//         const assetHash = image.hash;
//         const fileName = image.fileNames[0];

//         // Generate the image URL just once
//         const imageUrl = getImage(assetHash, fileName, post.author);
//         const height = 1080 * (index % 4 === 0 ? 2 : 1);

//         return {
//           id: post.id.toString(),
//           src: imageUrl,
//           key: post.id.toString(),
//           alt: post.prompt,
//           width: 1080,
//           height: height, // Adjust based on actual aspect ratio
//           srcSet: breakpoints.map((breakpoint) => ({
//             src: imageUrl, // Reuse the same URL instead of regenerating
//             width: breakpoint,
//             height: Math.round((height / 1080) * breakpoint), // Maintain aspect ratio
//           })),
//           prompt: post.prompt,
//           author: post.author,
//           category: post.category,
//           cpu: post.cpu,
//           createdAt: post.createdAt,
//           device: post.device,
//           isDraft: post.isDraft,
//           isPinned: post.isPinned,
//           isPrivate: post.isPrivate,
//           caption: post.caption,
//           seed: post.seed,
//         } as ExtendedPhoto;
//       }),
//     )
//     .filter(Boolean) as ExtendedPhoto[];
// };

export const formattedPhotosForGallery = (pages: Page[]): ExtendedPhoto[] => {
  return pages
    .flatMap((page) =>
      page.data.map((post: Post, index) => {
        const image = post.ipfsImages?.[0];
        if (!image || !image.hash || !image.fileNames?.[0]) return null;

        const assetHash = image.hash;
        const fileName = image.fileNames[0];
        const imageUrl = getImage(assetHash, fileName, post.author);

        // More dynamic width variations for visual interest
        const baseWidths = [300, 320, 340, 360, 380, 400];
        const baseWidth = baseWidths[post.id % baseWidths.length];

        // More diverse aspect ratios for Pinterest-like variety
        const aspectRatioSets = [
          // Portrait ratios (taller images)
          [0.6, 0.65, 0.7, 0.75, 0.8], // Tall portraits
          [0.85, 0.9, 0.95], // Medium portraits

          // Square ratios
          [1, 1, 1], // Perfect squares (weighted)

          // Landscape ratios (wider images)
          [1.1, 1.15, 1.2], // Slightly wide
          [1.25, 1.3, 1.35], // Medium landscape
          [1.4, 1.45, 1.5], // Wide landscape

          // Extra variety for visual interest
          [0.55, 1.6, 0.95, 1.2, 0.8], // Mixed ratios
        ];

        // Use a combination of post ID and index for more randomness
        const setIndex = (post.id + index) % aspectRatioSets.length;
        const ratioSet = aspectRatioSets[setIndex];
        const aspectRatio = ratioSet[(post.id * 3 + index) % ratioSet.length];

        // Calculate height with more dramatic variations
        let calculatedHeight = Math.round(baseWidth / aspectRatio);

        // Dynamic height constraints based on aspect ratio
        let minHeight, maxHeight;

        if (aspectRatio < 0.8) {
          // Portrait images
          minHeight = 350;
          maxHeight = 650;
        } else if (aspectRatio > 1.2) {
          // Landscape images
          minHeight = 200;
          maxHeight = 400;
        } else {
          // Square-ish images
          minHeight = 280;
          maxHeight = 450;
        }

        // Apply constraints
        if (calculatedHeight < minHeight) calculatedHeight = minHeight;
        if (calculatedHeight > maxHeight) calculatedHeight = maxHeight;

        // Add organic height variations for natural masonry flow
        const organicVariations = [
          0.95, 1.0, 1.05, 0.98, 1.02, 1.08, 0.92, 1.03, 0.97, 1.06, 0.94, 1.01,
          1.04, 0.99, 1.07, 0.96,
        ];

        const variationIndex = (post.id + index * 2) % organicVariations.length;
        const variation = organicVariations[variationIndex];
        const finalHeight = Math.round(calculatedHeight * variation);

        // Ensure we don't go below absolute minimums
        const constrainedHeight = Math.max(finalHeight, 180);

        // Calculate final aspect ratio
        const actualAspectRatio = baseWidth / constrainedHeight;

        return {
          id: post.id.toString(),
          src: imageUrl,
          key: post.id.toString(),
          alt: post.prompt,
          width: baseWidth,
          height: constrainedHeight,
          srcSet: breakpoints.map((breakpoint) => ({
            src: imageUrl,
            width: breakpoint,
            height: Math.round(breakpoint / actualAspectRatio),
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
      }),
    )
    .filter(Boolean) as ExtendedPhoto[];
};

export const formattedPhotosForGrid = (pages: Page[]): ExtendedPhoto[] => {
  return pages
    .flatMap((page) =>
      page.data.map((post: Post) => {
        const image = post.ipfsImages?.[0];
        if (!image || !image.hash || !image.fileNames?.[0]) return null;

        const assetHash = image.hash;
        const fileName = image.fileNames[0];

        // Generate the image URL just once
        const imageUrl = getImage(assetHash, fileName, post.author);

        return {
          id: post.id.toString(),
          src: imageUrl,
          key: post.id.toString(),
          alt: post.prompt,
          width: 1080,
          height: 1080, // Adjust based on actual aspect ratio
          srcSet: breakpoints.map((breakpoint) => ({
            src: imageUrl, // Reuse the same URL instead of regenerating
            width: breakpoint,
            height: breakpoint, // Maintain aspect ratio
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
      }),
    )
    .filter(Boolean) as ExtendedPhoto[];
};

export const formattedPhotos = (pages: Page[]): ExtendedPhoto[] => {
  return pages
    .flatMap((page) =>
      page.data.map((post: Post) => {
        const image = post.ipfsImages?.[0]; // Assuming only one image per post

        if (!image || !image.hash || !image.fileNames?.[0]) return null;

        const assetHash = image.hash;
        const fileName = image.fileNames[0];

        // Generate the image URL just once
        const imageUrl = getImage(assetHash, fileName, post.author);

        return {
          id: post.id.toString(),
          src: imageUrl,
          key: post.id.toString(),
          alt: post.prompt,
          width: 1080,
          height: 720, // Adjust based on actual aspect ratio
          srcSet: breakpoints.map((breakpoint) => ({
            src: imageUrl, // Reuse the same URL instead of regenerating
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
      }),
    )
    .filter(Boolean) as ExtendedPhoto[];
};
