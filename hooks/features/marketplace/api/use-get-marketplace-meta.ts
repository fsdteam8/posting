import { baseURL } from "@/constants";
import type { MarketplaceMetaResponse } from "@/types/features/marketplace";
import { useQuery } from "@tanstack/react-query";

export function useGetMarketplaceMeta() {
  return useQuery<MarketplaceMetaResponse, Error>({
    queryKey: ["marketplace", "meta"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/marketplace/meta`);

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
    staleTime: 1000 * 60 * 10, // 10 minutes — meta rarely changes
  });
}
