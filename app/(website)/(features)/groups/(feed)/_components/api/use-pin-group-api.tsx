import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"; // adjust if using different toast lib

type UsePinGroupArgs = {
  groupId: string;
  accessToken: string;
};

export function usePinGroup({ groupId, accessToken }: UsePinGroupArgs) {
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

      toast.success(pinned ? "Group pinned" : "Group unpinned");
    },
  });
}
