import { baseURL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

interface Params {
  groupId: string;
  accessToken: string;
  page?: number;
  limit?: number;
}

export interface PhotoAuthor {
  profileImage: { public_id: string; url: string };
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface PhotoMedia {
  url: string;
  public_id: string;
  _id: string;
  id: string;
}

export interface GroupPhoto {
  sourceType: string;
  groupId: string;
  postId: string;
  author: PhotoAuthor;
  media: PhotoMedia;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GroupPhotosResponse {
  success: boolean;
  message: string;
  data: GroupPhoto[];
  pagination: Pagination;
}

export function useGetGroupPhotos({
  groupId,
  accessToken,
  page = 1,
  limit = 20,
}: Params) {
  return useQuery<GroupPhotosResponse>({
    queryKey: ["group-photos", groupId, page, limit],
    queryFn: async () => {
      const res = await fetch(
        `${baseURL}/groups/${groupId}/media/photos?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to fetch group photos");
      }

      return res.json();
    },
  });
}
