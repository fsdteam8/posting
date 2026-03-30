// Add this to your existing @/types/features/posts file
// or create a new file at @/types/features/posts/feed.ts

import { Post } from "../posts";

export interface FeedPostsResponse {
  success: boolean;
  message: string;
  data: Post[]; // reuse your existing Post type
  pagination: {
    page: number;
    limit: number;
    total: number; // total records
    pages: number; // total pages
  };
}
