import { baseURL } from "@/constants";
import { Group, GroupsResponse } from "@/types/features/groups";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiRes = {
  success: boolean;
  message: string;
  data?: Group; // assuming backend returns joined group
};

type UseJoinGroupArgs = {
  groupId: string;
  accessToken: string;
};

export function useJoinGroup({ groupId, accessToken }: UseJoinGroupArgs) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error>({
    mutationKey: ["join-group", groupId],
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/groups/${groupId}/join`, {
        method: "PUT",
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

      // ✅ Add to joined-group cache
      queryClient.setQueryData<GroupsResponse>(
        ["joined-group", accessToken],
        (old) => {
          if (!old || !res.data) return old;

          // prevent duplicate insert
          const exists = old.data.some((g) => g._id === groupId);
          if (exists) return old;

          return {
            ...old,
            data: [res.data, ...old.data],
          };
        },
      );

      // ✅ Refresh single group info
      queryClient.invalidateQueries({
        queryKey: ["group"],
      });

      toast.success("Joined group");
    },
  });
}
