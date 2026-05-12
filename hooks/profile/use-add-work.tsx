import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiResponse = {
  success: boolean;
  message: string;
};

// Payload is a plain object — no undefined values, addWork always true
type AddWorkPayload = Record<string, unknown> & { addWork: true };

export function useAddWork({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, Record<string, unknown>>({
    mutationKey: ["add-work"],

    mutationFn: async (work) => {
      const payload: AddWorkPayload = {
        ...work,
        addWork: true,
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
        toast.error(res.message ?? "Failed to add work");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(res.message || "Work added");
    },

    onError: (err) => {
      toast.error(err.message ?? "Something went wrong");
    },
  });
}
