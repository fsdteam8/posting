import { baseURL } from "@/constants";
import type {
  ListingStatus,
  MarketplaceMyListingsResponse,
} from "@/types/features/marketplace";
import { useQuery } from "@tanstack/react-query";

type Params = {
  accessToken: string;
  page?: number;
  limit?: number;
  status?: ListingStatus;
};

export function useGetMyListings({
  accessToken,
  page = 1,
  limit = 10,
  status,
}: Params) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status ? { status } : {}),
  });

  return useQuery<MarketplaceMyListingsResponse, Error>({
    queryKey: ["marketplace", "my-listings", { page, limit, status }],

    queryFn: async () => {
      const res = await fetch(
        `${baseURL}/marketplace/my/listings?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

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

    enabled: !!accessToken,
  });
}
