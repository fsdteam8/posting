import { baseURL } from "@/constants";
import type { MarketplaceListing } from "@/types/features/marketplace";
import { useQuery } from "@tanstack/react-query";

// ─── Response types ───────────────────────────────────────────────────────────

type SellerRating = {
  avgRating: number;
  totalRatings: number;
};

// Related listings are a lightweight subset — not the full MarketplaceListing shape
type RelatedListing = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  listingStatus: string;
  photos: { url: string; public_id: string }[];
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  createdAt: string;
};

type GetListingData = {
  listing: MarketplaceListing;
  sellerRating: SellerRating;
  relatedListings: RelatedListing[];
};

type GetListingResponse = {
  success: boolean;
  message: string;
  data: GetListingData;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

type Params = {
  listingId: string | null;
  accessToken?: string; // optional — endpoint may be public, include if your API requires it
};

/**
 * Fetches a single marketplace listing by ID.
 *
 * Returns the full listing object, the seller's rating summary, and a short
 * list of related listings in the same category.
 *
 * - Query is disabled when listingId is null/empty, so it is safe to call
 *   this hook before the ID is known (e.g. while routing is resolving).
 * - queryKey includes listingId so each listing gets its own cache entry.
 */
export function useGetListing({ listingId, accessToken }: Params) {
  return useQuery<GetListingResponse, Error>({
    queryKey: ["marketplace", "listing", listingId],

    queryFn: async () => {
      const res = await fetch(`${baseURL}/marketplace/listings/${listingId}`, {
        // Include Authorization header only when a token is provided.
        // Some listing detail pages may be publicly accessible.
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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

    // Do not run the query until a real listingId is available
    enabled: !!listingId,

    // Keep the listing fresh for 2 minutes — it changes more frequently
    // than meta (price edits, status changes, view count updates).
    staleTime: 1000 * 60 * 2,
  });
}
