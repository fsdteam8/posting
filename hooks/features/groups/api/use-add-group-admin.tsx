import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";

interface AddGroupAdminParams {
  groupId: string;
  accessToken: string;
}

export function useAddGroupAdmin({
  groupId,
  accessToken,
}: AddGroupAdminParams) {
  return useMutation({
    mutationKey: ["add-group-admin", groupId],
    mutationFn: async (targetUserId: string) => {
      const res = await fetch(
        `${baseURL}/groups/${groupId}/admin/${targetUserId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to add group admin");
      }

      return res.json();
    },
  });
}
