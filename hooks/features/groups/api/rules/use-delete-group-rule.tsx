import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";

interface DeleteGroupRuleParams {
  groupId: string;
  groupRuleId: string;
  accessToken: string;
}

export function useDeleteGroupRule({
  groupId,
  groupRuleId,
  accessToken,
}: DeleteGroupRuleParams) {
  return useMutation({
    mutationKey: ["delete-group-rule", groupId, groupRuleId],
    mutationFn: async () => {
      const res = await fetch(
        `${baseURL}/groups/${groupId}/rules/${groupRuleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to delete group rule");
      }

      return res.json();
    },
  });
}
