import type {
  ApiRes,
  PaginatedApiRes,
} from "@/types/features/pages";
import type { Post } from "@/types/features/posts";

export type CollectionPrivacy = "public" | "friends" | "private";

export type SavedCollection = {
  _id: string;
  name: string;
  user: string;
  coverImage: {
    public_id: string;
    url: string;
  };
  privacy: CollectionPrivacy;
  createdAt: string;
  updatedAt: string;
};

export type SavedItem = {
  _id: string;
  user: string;
  post: Post;
  collectionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SavedItemsApiRes = PaginatedApiRes<SavedItem[]>;
export type CollectionsApiRes = ApiRes<SavedCollection[]>;
export type CollectionApiRes = ApiRes<SavedCollection>;

export type ToggleSavePostApiRes = ApiRes<{
  saved: boolean;
  postId: string;
  collectionId: string | null;
}>;
