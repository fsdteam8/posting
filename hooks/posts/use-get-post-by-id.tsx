import { baseURL } from "@/constants";
import { Post } from "@/types/features/posts";
import { useQuery } from "@tanstack/react-query";

type GetPostRes = {
  success: boolean;
  message: string;
  data: Post & {
    comments: PostComment[];
    reactionSummary: Record<string, number>;
    isSaved: boolean;
  };
};

// Inline comment type — extend your global types if preferred
export type PostComment = {
  _id: string;
  post: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    profileImage: { public_id: string; url: string };
  };
  parentComment: string | null;
  content: string;
  mentions: string[];
  reactionCount: number;
  repliesCount: number;
  editedAt: string | null;
  isDeleted: boolean;
  images: string[];
  reactions: unknown[];
  createdAt: string;
  updatedAt: string;
};

type UseGetPostByIdParams = {
  postId: string;
  accessToken: string;
};

export function useGetPostById({ postId, accessToken }: UseGetPostByIdParams) {
  return useQuery<GetPostRes, Error>({
    queryKey: ["post", postId],
    enabled: !!postId && !!accessToken,

    queryFn: async () => {
      const res = await fetch(`${baseURL}/posts/${postId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
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
  });
}
