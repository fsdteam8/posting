import { baseURL } from "@/constants";
import type {
  CollectionApiRes,
  CollectionPrivacy,
} from "@/types/features/saved";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = { accessToken: string };

type Payload = {
  name: string;
  privacy?: CollectionPrivacy;
  coverImage?: File | null;
};

export function useCreateCollection({ accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation<CollectionApiRes, Error, Payload>({
    mutationKey: ["create-collection"],

    mutationFn: async ({ name, privacy = "private", coverImage }) => {
      const form = new FormData();
      form.append("name", name);
      form.append("privacy", privacy);
      if (coverImage) form.append("coverImage", coverImage);

      const res = await fetch(`${baseURL}/collections`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
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

    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      toast.success(data.message || "Collection created");
      queryClient.invalidateQueries({ queryKey: ["collections", "me"] });
    },

    onError: (err) => {
      toast.error(err.message || "Failed to create collection");
    },
  });
}
