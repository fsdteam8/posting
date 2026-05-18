import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiResponse = {
  success: boolean;
  message: string;
};

type EditEducationPayload = Record<string, unknown> & { educationId: string };

export function useEditEducation({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse,
    Error,
    Record<string, unknown> & { educationId: string }
  >({
    mutationKey: ["edit-education"],

    mutationFn: async ({ educationId, ...education }) => {
      const payload: EditEducationPayload = {
        ...education,
        educationId,
      };

      const res = await fetch(`${baseURL}/users/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
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
        toast.error(res.message ?? "Failed to update education");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(res.message || "Education updated");
    },

    onError: (err) => {
      toast.error(err.message ?? "Something went wrong");
    },
  });
}
