import { baseURL } from "@/constants";
import { Story } from "@/types/features/feed/story";
import { useMutation } from "@tanstack/react-query";

interface Params {
  accessToken: string;
}

interface StoryResponse {
  success: boolean;
  message: string;
  data: Story;
}

export function useCreateStory({ accessToken }: Params) {
  return useMutation({
    mutationKey: ["create-story"],
    mutationFn: async (body: FormData) => {
      // FormData fields: text, backgroundColor, privacy, customAudience, media
      const res = await fetch(`${baseURL}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // DO NOT set Content-Type — browser sets multipart boundary automatically
        },
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to create story");
      }

      return res.json() as Promise<StoryResponse>;
    },
  });
}
