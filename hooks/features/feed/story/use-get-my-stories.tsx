import { baseURL } from "@/constants";
import { Story } from "@/types/features/feed/story";
import { useQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
}

interface GetMyStoriesResponse {
  success: boolean;
  message: string;
  data: Story[];
}

export function useGetMyStories({ accessToken }: Params) {
  return useQuery({
    queryKey: ["my-stories"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/stories/me/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to fetch stories");
      }

      return res.json() as Promise<GetMyStoriesResponse>;
    },
    enabled: !!accessToken,
  });
}
