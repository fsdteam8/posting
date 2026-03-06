import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateGroupRuleParams {
  groupId: string;
  accessToken: string;
  onSuccess?: () => void;
}

interface GroupRuleBody {
  title: string;
  description: string;
}

export function useCreateGroupRule({
  groupId,
  accessToken,
  onSuccess,
}: CreateGroupRuleParams) {
  return useMutation({
    mutationKey: ["create-group-rule", groupId],
    mutationFn: async (body: GroupRuleBody) => {
      const res = await fetch(`${baseURL}/groups/${groupId}/rules`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to create group rule");
      }

      return res.json();
    },
    onError: (err) => {
      toast.error(err.message);
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // handle success
      onSuccess?.();
    },
  });
}
