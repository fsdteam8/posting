import { baseURL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

interface Params {
  groupId: string;
  accessToken: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
}

export interface AlbumCreatedBy {
  profileImage: { public_id: string; url: string };
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface GroupAlbum {
  coverImage: { url: string; public_id: string };
  _id: string;
  group: string;
  title: string;
  description: string;
  photos: string[];
  createdBy: AlbumCreatedBy;
  privacy: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  photoCount: number;
}

export interface GroupAlbumsResponse {
  success: boolean;
  message: string;
  data: GroupAlbum[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useGetGroupAlbums({
  groupId,
  accessToken,
  page = 1,
  limit = 20,
  searchQuery = "",
}: Params) {
  return useQuery<GroupAlbumsResponse>({
    queryKey: ["group-albums", groupId, page, limit, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(searchQuery && { q: searchQuery }),
      });

      const res = await fetch(
        `${baseURL}/groups/${groupId}/media/albums?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to fetch group albums");
      }

      return res.json();
    },
  });
}
