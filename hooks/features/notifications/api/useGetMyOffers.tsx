import { baseURL } from "@/constants";
import { useInfiniteQuery } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "countered"
  | "expired";

type OfferListingSeller = {
  profileImage: { public_id: string; url: string };
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
};

type OfferListing = {
  _id: string;
  seller: OfferListingSeller;
  title: string;
  price: number;
  currency: string;
  listingStatus: string;
  isDeleted: boolean;
  photos: { url: string; public_id: string }[];
  createdAt: string;
};

export type MyOffer = {
  _id: string;
  listing: OfferListing;
  buyer: string;
  seller: string;
  amount: number;
  currency: string;
  message: string;
  status: OfferStatus;
  counterAmount: number | null;
  expiresAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type MyOffersPage = {
  success: boolean;
  message: string;
  data: MyOffer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// ─── Params ───────────────────────────────────────────────────────────────────

type Params = {
  accessToken: string;
  status?: OfferStatus;
  limit?: number;
};

/**
 * Fetches the current user's sent offers with infinite scroll support.
 *
 * Filtering by status is optional — omit to fetch all offers regardless
 * of their current state (pending, accepted, countered, etc.).
 *
 * useInfiniteQuery is used even though infinite scroll isn't wired up yet,
 * so adding it later requires zero hook changes — just pass the props to
 * whatever list component you build.
 */
export function useGetMyOffers({ accessToken, status, limit = 10 }: Params) {
  return useInfiniteQuery<MyOffersPage, Error>({
    queryKey: ["marketplace", "my-offers", { status, limit }],

    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
        ...(status ? { status } : {}),
      });

      const res = await fetch(
        `${baseURL}/marketplace/offers/me?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          msg = body?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }

      return res.json();
    },

    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },

    initialPageParam: 1,
    enabled: !!accessToken,
    staleTime: 1000 * 60, // 1 minute — offer statuses change frequently
  });
}
