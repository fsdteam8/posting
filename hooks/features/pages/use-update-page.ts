import { baseURL } from "@/constants";
import type {
  ApiRes,
  Page,
  PageContact,
  PageHours,
  PageLocation,
} from "@/types/features/pages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type UpdatePagePayload = {
  name?: string;
  category?: string;
  description?: string;
  bio?: string;
  contact?: PageContact;
  location?: PageLocation;
  hours?: PageHours;
  visibility?: "public" | "private";
  profileImage?: File;
  coverImage?: File;
};

export function useUpdatePage({
  accessToken,
  pageId,
}: {
  accessToken: string;
  pageId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes<Page>, Error, UpdatePagePayload>({
    mutationKey: ["update-page", pageId],

    mutationFn: async (payload) => {
      const formData = new FormData();

      // Use `!== undefined` so empty strings can clear existing values.
      if (payload.name !== undefined) formData.append("name", payload.name);
      if (payload.category !== undefined)
        formData.append("category", payload.category);
      if (payload.description !== undefined)
        formData.append("description", payload.description);
      if (payload.bio !== undefined) formData.append("bio", payload.bio);
      if (payload.visibility) formData.append("visibility", payload.visibility);
      if (payload.contact)
        formData.append("contact", JSON.stringify(payload.contact));
      if (payload.location)
        formData.append("location", JSON.stringify(payload.location));
      if (payload.hours)
        formData.append("hours", JSON.stringify(payload.hours));
      if (payload.profileImage)
        formData.append("profileImage", payload.profileImage);
      if (payload.coverImage) formData.append("coverImage", payload.coverImage);

      const res = await fetch(`${baseURL}/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // NOTE: Do NOT set Content-Type manually for FormData
        },
        body: formData,
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

    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      queryClient.setQueryData<ApiRes<Page>>(["page", pageId], (old) => {
        if (!old || !res.data) return old;
        return { ...old, data: res.data };
      });

      queryClient.invalidateQueries({ queryKey: ["my-pages"] });

      toast.success(res.message || "Page updated successfully");
    },
  });
}
