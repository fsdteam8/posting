import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";

interface Params {
  groupUserName: string;
  accessToken: string;
}

export function useMarkAsVisitedGroup({ groupUserName, accessToken }: Params) {
  return useMutation({
    mutationKey: ["mark-as-visited-group", groupUserName],
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/groups/${groupUserName}/visit`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to mark group as visited");
      }

      return res.json();
    },
  });
}
