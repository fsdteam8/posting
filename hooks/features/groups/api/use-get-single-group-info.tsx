import { baseURL } from "@/constants";
import { GetSingleGroupResponse } from "@/types/features/groups";
import { useQuery } from "@tanstack/react-query";

interface Params {
  username: string;
  accessToken: string;
}

export function useGetSingleGroup({ username, accessToken }: Params) {
  return useQuery<GetSingleGroupResponse>({
    queryKey: ["group", username],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/groups/username/${username}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch group");
      }

      return res.json();
    },
    enabled: Boolean(username && accessToken),
  });
}
