export type PageHours = {
  status:
    | "Always open"
    | "Permanently closed"
    | "Temporarily closed"
    | "No hours available"
    | "Selected hours";
  details?: Record<string, unknown>;
};

export type PageContact = {
  website?: string;
  email?: string;
  phone?: string;
};

export type PageLocation = {
  address?: string;
  city?: string;
  postcode?: string;
};

export type PageImage = {
  url: string;
  public_id: string;
};

export type PageTransparency = {
  pageId: string;
  adminInfo: string;
  isRunningAds: boolean;
  createdAt: string;
};

export type CurrentUserMeta = {
  isFollowing: boolean;
  isLiked: boolean;
  notifications: string;
};

export type Page = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  bio: string;
  profileImage: PageImage;
  coverImage: PageImage;
  contact: PageContact;
  location: PageLocation;
  hours: PageHours;
  createdBy: string;
  admins: string[];
  moderators: string[];
  followersCount: number;
  likesCount: number;
  isVerified: boolean;
  visibility: "public" | "private";
  transparency: PageTransparency;
  currentUserMeta: CurrentUserMeta;
  createdAt: string;
  updatedAt: string;
};

export type PostImage = {
  url: string;
  public_id: string;
};

export type PostVideo = {
  url: string;
  public_id: string;
  thumbnail: string;
  duration: number;
};

export type Post = {
  _id: string;
  author: string;
  page: string | null;
  group: string | null;
  content?: string;
  title?: string;
  images: PostImage[];
  videos: PostVideo[];
  postType: string;
  status: string;
  visibility: string;
  tags: string[];
  mentions: string[];
  sharedPost?: string | null;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ApiRes<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export type PaginatedApiRes<T = unknown> = ApiRes<T> & {
  pagination: Pagination;
};
