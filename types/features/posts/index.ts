import { Pagination } from "@/types";

export interface GroupPost {
  video: {
    url: string;
    public_id: string;
    thumbnail: string;
    duration: number;
  };
  checkIn: {
    name: string;
    coordinates: number[];
  };
  _id: string;
  title: string;
  content: string;
  postType: "text" | "image" | "video" | "reel" | "shared";
  sharedPost: string | null;
  sharedMessage: string;
  tags: string[];
  mentions: string[];
  feeling: string;
  activity: string;
  backgroundColor: string;
  author: {
    profileImage: {
      public_id: string;
      url: string;
    };
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  group: {
    _id: string;
    name: string;
    privacy: "public" | "private";
  };
  status: "published" | "draft" | "archived";
  visibility: "public" | "only me" | "friends" | "friends of friends";
  views: number;
  reactionCount: number;
  saveCount: number;
  shareCount: number;
  commentCount: number;
  allowComments: boolean;
  isPinned: boolean;
  reportedBy: string[];
  reportCount: number;
  hiddenFor: string[];
  isDeleted: boolean;
  images: string[];
  reactions: string[];
  publishedAt: string;
  excerpt: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  comments: string[];
  id: string;
}

export interface GroupPostsResponse {
  success: boolean;
  message: string;
  data: GroupPost[];
  pagination: Pagination;
}
