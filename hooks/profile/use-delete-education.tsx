import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiResponse = {
  success: boolean;
  message: string;
};

export function useDeleteEducation({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, { educationId: string }>({
    mutationKey: ["delete-education"],

    mutationFn: async ({ educationId }) => {
      const res = await fetch(`${baseURL}/users/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          educationId,
          deleteEducation: true,
        }),
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
        toast.error(res.message ?? "Failed to delete education");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(res.message || "Education deleted");
    },

    onError: (err) => {
      toast.error(err.message ?? "Something went wrong");
    },
  });
}
