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
  isDraft: boolean | null;
  like_count: number | null;
  n: number | null;
  prompt: string | null;
  seed: number | null;
};

export interface JobSpec extends Post {
  module?: string;
  version?: string; //version
  inputs?: Record<string, string | number>;
}

// Define proper types for pages
export interface Page {
  data: Post[];
  nextCursor?: number;
}

export interface FollowStats {
  followerCount: number;
  followeeCount: number;
}

export interface Like {
  id: number;
  author: string | null;
  created_at: string;
  post_id: number | null;
}
