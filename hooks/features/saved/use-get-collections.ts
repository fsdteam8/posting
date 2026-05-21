import { baseURL } from "@/constants";
import type { CollectionsApiRes } from "@/types/features/saved";
import { useQuery } from "@tanstack/react-query";

type Params = { accessToken: string };

export function useGetCollections({ accessToken }: Params) {
  return useQuery<CollectionsApiRes, Error>({
    queryKey: ["collections", "me"],
    enabled: Boolean(accessToken),

    queryFn: async () => {
      const res = await fetch(`${baseURL}/collections/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
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

    staleTime: 1000 * 60,
  });
}
