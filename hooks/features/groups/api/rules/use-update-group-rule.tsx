import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";

interface UpdateGroupRuleParams {
  groupId: string;
  groupRuleId: string;
  accessToken: string;
}

interface GroupRuleBody {
  title: string;
  description: string;
}

export function useUpdateGroupRule({
  groupId,
  groupRuleId,
  accessToken,
}: UpdateGroupRuleParams) {
  return useMutation({
    mutationKey: ["update-group-rule", groupId, groupRuleId],
    mutationFn: async (body: GroupRuleBody) => {
      const res = await fetch(
        `${baseURL}/groups/${groupId}/rules/${groupRuleId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to update group rule");
      }

      return res.json();
    },
  });
}
