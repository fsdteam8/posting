import { Post } from "../posts";

export type SearchType = "all" | "users" | "posts" | "groups" | "events";

export type SearchUser = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  profileImage: { public_id: string; url: string };
  coverImage: { public_id: string; url: string };
  isOnline: boolean;
  followers: string[];
  following: string[];
  accountStatus: string;
};

export type SearchPost = Pick<
  Post,
  | "_id"
  | "content"
  | "postType"
  | "author"
  | "images"
  | "reactionCount"
  | "commentCount"
  | "shareCount"
  | "saveCount"
  | "visibility"
  | "isDeleted"
  | "isPinned"
  | "publishedAt"
  | "createdAt"
> & {
  group: string | null;
  page: string | null;
  videos: string[];
};

export type SearchGroup = {
  _id: string;
  name: string;
  groupUserName: string;
  description?: string;
  category: string;
  privacy: "public" | "private";
  members: string[];
  admins: string[];
  isJoined: boolean;
  coverImage?: { url: string; public_id: string };
  createdAt: string;
};

export type SearchEvent = {
  _id: string;
  title: string;
  description: string;
  host: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    profileImage: { public_id: string; url: string };
  };
  privacy: "public" | "private";
  location: string;
  date: string;
  endDate: string;
  rsvps: string[];
  createdAt: string;
};

export type SearchData = {
  users: SearchUser[];
  posts: Post[];
  groups: SearchGroup[];
  events: SearchEvent[];
};

export type SearchApiRes = {
  success: boolean;
  message: string;
  data: SearchData;
};
