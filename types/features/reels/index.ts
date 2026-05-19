import { Pagination } from "@/types";
import { Post } from "../posts";

export type Reel = Post;

export interface ReelsResponse {
  success: boolean;
  message: string;
  data: Reel[];
  pagination: Pagination;
}
