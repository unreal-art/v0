export type UploadResponse = {
  name: string;
  hash: string;
  size: string;
  fileNames: string[];
};

export type Post = {
  author: string;
  category: string | null;
  cpu: number | null;
  createdAt: string;
  device: string | null;
  id: number;
  ipfsImages: UploadResponse[] | null;
  isPinned: boolean | null;
  isPrivate: boolean | null;
  like_count: number | null;
  n: number | null;
  prompt: string | null;
  seed: number | null;
};

// Define proper types for pages
export interface Page {
  data: Post[];
  nextCursor?: number;
}

export interface FollowStats {
  followerCount: number;
  followeeCount: number;
}
