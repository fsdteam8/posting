import { baseURL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

interface Params {
  groupId: string;
  accessToken: string;
  page?: number;
  limit?: number;
}

export interface VideoAuthor {
  profileImage: { public_id: string; url: string };
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface VideoMedia {
  url: string;
  public_id: string;
  thumbnail: string;
  duration: number;
  _id: string;
  id: string;
}

export interface GroupVideo {
  sourceType: string;
  groupId: string;
  postId: string;
  author: VideoAuthor;
  media: VideoMedia;
  createdAt: string;
}

export interface GroupVideosResponse {
  success: boolean;
  message: string;
  data: GroupVideo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useGetGroupVideos({
  groupId,
  accessToken,
  page = 1,
  limit = 20,
}: Params) {
  return useQuery<GroupVideosResponse>({
    queryKey: ["group-videos", groupId, page, limit],
    queryFn: async () => {
      const res = await fetch(
        `${baseURL}/groups/${groupId}/media/videos?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to fetch group videos");
      }

      return res.json();
    },
  });
}
