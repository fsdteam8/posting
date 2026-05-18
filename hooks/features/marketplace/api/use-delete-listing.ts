import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiRes = {
  success: boolean;
  message: string;
};

export function useDeleteListing({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error, string>({
    mutationKey: ["marketplace", "delete-listing"],

    mutationFn: async (listingId) => {
      const res = await fetch(`${baseURL}/marketplace/listings/${listingId}`, {
        method: "DELETE",
        headers: {
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

    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["marketplace", "my-listings"],
      });
      queryClient.invalidateQueries({ queryKey: ["marketplace", "listings"] });

      toast.success(res.message || "Listing deleted");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to delete listing");
    },
  });
}
