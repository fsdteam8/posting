import { baseURL } from "@/constants";
import { ApiRes, Page } from "@/types/features/pages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type CreatePagePayload = {
  name: string;
  category?: string;
  description?: string;
  bio?: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  profileImage?: File;
  coverImage?: File;
};

export function useCreatePage({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes<Page>, Error, CreatePagePayload>({
    mutationKey: ["create-page"],

    mutationFn: async (payload) => {
      const formData = new FormData();

      formData.append("name", payload.name);
      if (payload.category) formData.append("category", payload.category);
      if (payload.description)
        formData.append("description", payload.description);
      if (payload.bio) formData.append("bio", payload.bio);
      if (payload.website) formData.append("website", payload.website);
      if (payload.email) formData.append("email", payload.email);
      if (payload.phone) formData.append("phone", payload.phone);
      if (payload.location) formData.append("location", payload.location);
      if (payload.profileImage)
        formData.append("profileImage", payload.profileImage);
      if (payload.coverImage) formData.append("coverImage", payload.coverImage);

      const res = await fetch(`${baseURL}/pages`, {
        method: "POST",
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

      queryClient.invalidateQueries({ queryKey: ["my-pages"] });

      toast.success(res.message || "Page created successfully");
    },
  });
}
