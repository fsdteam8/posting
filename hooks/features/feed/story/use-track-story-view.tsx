import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";

interface Params {
  accessToken: string;
}

interface TrackStoryViewResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    user: string;
    media: string[];
    viewers: string[];
    privacy: "public" | "friends" | "custom";
    customAudience: string[];
    text: string;
    backgroundColor: string;
    replyCount: number;
    expiresAt: string;
    reactions: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export function useTrackStoryView({ accessToken }: Params) {
  return useMutation({
    mutationKey: ["track-story-view"],
    mutationFn: async (storyId: string) => {
      const res = await fetch(`${baseURL}/stories/${storyId}/view`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to track story view");
      }

      return res.json() as Promise<TrackStoryViewResponse>;
    },
  });
}
