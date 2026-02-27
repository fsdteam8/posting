import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // or your toast lib
import { GroupsResponse } from "../../joined/_components/joined-group-container";

type ApiRes = {
  success: boolean;
  message: string;
};

type UseLeaveGroupArgs = {
  groupId: string;
  accessToken: string;
};

export function useLeaveGroup({ groupId, accessToken }: UseLeaveGroupArgs) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error>({
    mutationKey: ["leave-group", groupId],
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/groups/${groupId}/leave`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
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

      // remove from "joined-group" cache
      queryClient.setQueryData<GroupsResponse>(
        ["joined-group", accessToken],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((g) => g._id !== groupId),
          };
        },
      );

      toast.success("Left group");
    },
  });
}
