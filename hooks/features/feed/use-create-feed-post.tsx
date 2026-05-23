import { baseURL } from "@/constants";
import type { FeedPostsResponse } from "@/types/features/feed";
import type { Post } from "@/types/features/posts";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Params {
  accessToken: string;
}

interface CreatePostResponse {
  success: boolean;
  message: string;
  data: Post;
}

export function useCreateFeedPost({ accessToken }: Params) {
  const queryClient = useQueryClient();
  return useMutation<CreatePostResponse, Error, FormData>({
    mutationKey: ["create-feed-post"],
    mutationFn: async (body: FormData) => {
      const res = await fetch(`${baseURL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // DO NOT set Content-Type here — browser sets it automatically
          // with the correct multipart boundary for FormData
        },
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to create post");
      }

      return res.json();
    },
    onSuccess: (res) => {
      const newPost = res?.data;

      // Prepend the new post to the cached feed so it shows on top
      // immediately. We can't rely on a refetch — the backend feed
      // explicitly excludes the current user's own posts.
      if (newPost) {
        queryClient.setQueryData<InfiniteData<FeedPostsResponse>>(
          ["feed-posts"],
          (old) => {
            if (!old || old.pages.length === 0) return old;
            const [first, ...rest] = old.pages;
            // Avoid duplicates if a refetch races ahead of us
            if (first.data.some((p) => p._id === newPost._id)) return old;
            return {
              ...old,
              pages: [{ ...first, data: [newPost, ...first.data] }, ...rest],
            };
          },
        );
      }

      // Refresh the author's profile timeline (key is
      // ["timeline-posts", userId] — prefix match covers all users).
      queryClient.invalidateQueries({ queryKey: ["timeline-posts"] });
    },
  });
}
