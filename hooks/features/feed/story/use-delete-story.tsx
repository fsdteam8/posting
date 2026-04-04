import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";

interface Params {
  accessToken: string;
}

interface DeleteStoryResponse {
  success: boolean;
  message: string;
  data: {
    storyId: string;
  };
}

export function useDeleteStory({ accessToken }: Params) {
  return useMutation({
    mutationKey: ["delete-story"],
    mutationFn: async (storyId: string) => {
      const res = await fetch(`${baseURL}/stories/${storyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to delete story");
      }

      return res.json() as Promise<DeleteStoryResponse>;
    },
  });
}
