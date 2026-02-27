import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // adjust if using different toast lib
import { GroupsResponse } from "../../joined/_components/joined-group-container";

type UsePinGroupArgs = {
  groupId: string;
  accessToken: string;
};

export function usePinGroup({ groupId, accessToken }: UsePinGroupArgs) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["pin-group", groupId],
    mutationFn: async (pinned: boolean) => {
      const res = await fetch(`${baseURL}/groups/${groupId}/pin`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ pinned }),
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
    onSuccess: (res, pinned) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      const nowIso = new Date().toISOString();

      queryClient.setQueryData<GroupsResponse>(
        ["joined-group", accessToken],
        (old) => {
          if (!old) return old;

          const prepareddata = {
            ...old,
            data: old.data.map((group) => {
              if (group._id !== groupId) return group;

              const prev = group.currentUserMeta ?? {
                isPinned: false,
                pinnedAt: null,
                lastVisitedAt: null,
              };

              return {
                ...group,
                currentUserMeta: {
                  ...prev,
                  isPinned: pinned,
                  pinnedAt: pinned ? nowIso : null,
                },
              };
            }),
          };

          console.log(prepareddata);
          return prepareddata;
        },
      );

      toast.success(pinned ? "Group pinned" : "Group unpinned");
    },
  });
}
