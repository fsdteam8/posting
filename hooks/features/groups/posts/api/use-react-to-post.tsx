import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";

type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry" | "care";

type ApiRes = {
  success: boolean;
  message: string;
  data?: {
    reactionCount: number;
    reactions: { user: string; type: ReactionType }[];
  };
};

type Params = {
  postId: string;
  groupId: string;
  accessToken: string;
  loggedInUserId: string;
};

export function useReactToPost({ postId, accessToken }: Params) {
  return useMutation<ApiRes, Error, { type: ReactionType }>({
    mutationKey: ["react-post", postId],

    mutationFn: async ({ type }) => {
      const res = await fetch(`${baseURL}/posts/${postId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          message = body?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return res.json();
    },

    onSuccess: () => {},
  });
}
