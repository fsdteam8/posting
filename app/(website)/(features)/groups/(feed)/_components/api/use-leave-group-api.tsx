import { baseURL } from "@/constants";
import {
  GetSingleGroupResponse,
  GroupsResponse,
} from "@/types/features/groups";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // or your toast lib

type ApiRes = {
  success: boolean;
  message: string;
};

type UseLeaveGroupArgs = {
  groupId: string;
  accessToken: string;
  cu?: {
    username: string;
    id: string;
  };
};

export function useLeaveGroup({ groupId, accessToken, cu }: UseLeaveGroupArgs) {
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

      // ✅ on the future just remove loggedInUserFrom member
      if (cu) {
        queryClient.setQueryData<GetSingleGroupResponse>(
          ["group", cu.username],
          (old) => {
            if (!old) return old;

            const updatedMembers = old.data.members.filter(
              (item) => item._id !== cu.id,
            );

            return {
              ...old,
              data: {
                ...old.data,
                members: updatedMembers,
              },
            };
          },
        );
      }

      toast.success("Left group");
    },
  });
}
