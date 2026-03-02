import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiRes = {
  success: boolean;
  message: string;
  data?: {
    saved: boolean;
    postId: string;
  };
};

type Params = {
  postId: string;
  accessToken: string;
};

export function useSavePost({ postId, accessToken }: Params) {
  return useMutation<ApiRes, Error, void>({
    mutationKey: ["save-post", postId],

    mutationFn: async () => {
      const res = await fetch(`${baseURL}/posts/${postId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

    onSuccess: (data: ApiRes) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // handle success
      toast.success(data.message);
    },
  });
}
