import { baseURL } from "@/constants";
import type { MessengerUser } from "@/types/messenger";
import { useQuery } from "@tanstack/react-query";

export type StoryMedia = {
  url: string;
  public_id?: string;
  type: "image" | "video";
  thumbnail?: string;
};

export type Story = {
  _id: string;
  user: MessengerUser;
  media: StoryMedia[];
  text?: string;
  createdAt: string;
};

export type StoriesGroup = {
  user: MessengerUser;
  stories: Story[];
};

export type StoriesResponse = {
  success: boolean;
  message: string;
  data: StoriesGroup[];
};

export function useStories({ accessToken }: { accessToken: string }) {
  return useQuery<StoriesResponse, Error>({
    queryKey: ["messenger", "stories"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/stories`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          msg = body?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    staleTime: 1000 * 60,
  });
}
