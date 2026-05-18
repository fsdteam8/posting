import { baseURL } from "@/constants";
import type {
  DeliveryOption,
  ListingCondition,
  ListingType,
  MarketplaceListingResponse,
} from "@/types/features/marketplace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Payload ──────────────────────────────────────────────────────────────────
//
// Photos and video are File objects here — the hook converts everything to
// FormData before sending so the server receives multipart/form-data.
// DO NOT set Content-Type manually; the browser sets it with the boundary.

export type CreateListingFormPayload = {
  title: string;
  description?: string;
  listingType: ListingType;
  category: string;
  subcategory?: string;
  condition?: ListingCondition;
  price: number;
  currency?: string;
  isNegotiable?: boolean;
  quantity?: number;
  deliveryOptions?: DeliveryOption[];
  shippingEligible?: boolean;
  hideFromFriends?: boolean;
  // Location
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  // Media — File objects, appended individually to FormData
  photos?: File[];
  video?: File | null;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCreateListing({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<
    MarketplaceListingResponse,
    Error,
    CreateListingFormPayload
  >({
    mutationKey: ["marketplace", "create-listing"],

    mutationFn: async (payload) => {
      const form = new FormData();

      // ── Scalar fields ──────────────────────────────────────────────────────
      form.append("title", payload.title);
      form.append("listingType", payload.listingType);
      form.append("category", payload.category);
      form.append("price", String(payload.price));

      if (payload.description) form.append("description", payload.description);
      if (payload.subcategory) form.append("subcategory", payload.subcategory);
      if (payload.condition) form.append("condition", payload.condition);
      if (payload.currency) form.append("currency", payload.currency);
      if (payload.quantity) form.append("quantity", String(payload.quantity));

      // Booleans must be sent as strings in FormData
      form.append("isNegotiable", String(payload.isNegotiable ?? true));
      form.append("hideFromFriends", String(payload.hideFromFriends ?? false));
      form.append(
        "shippingEligible",
        String(payload.shippingEligible ?? false),
      );

      // ── Delivery options — append each value separately ────────────────────
      // Express/multer reads repeated keys as an array: deliveryOptions[]
      (payload.deliveryOptions ?? []).forEach((opt) => {
        form.append("deliveryOptions[]", opt);
      });

      // ── Location fields ────────────────────────────────────────────────────
      if (payload.address) form.append("location[address]", payload.address);
      if (payload.city) form.append("location[city]", payload.city);
      if (payload.state) form.append("location[state]", payload.state);
      if (payload.country) form.append("location[country]", payload.country);
      if (payload.postalCode)
        form.append("location[postalCode]", payload.postalCode);

      // ── Photos — append each File under the "photos" key ──────────────────
      // multer({ fields: [{ name: "photos", maxCount: 10 }] }) reads these
      // as an array on the server.
      (payload.photos ?? []).forEach((file) => {
        form.append("photos", file);
      });

      // ── Video — single file ────────────────────────────────────────────────
      if (payload.video) {
        form.append("video", payload.video);
      }

      const res = await fetch(`${baseURL}/marketplace/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // ⚠️ Do NOT set Content-Type here — the browser sets it automatically
          // with the correct multipart boundary when body is FormData.
        },
        body: form,
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

      // Invalidate both the browse grid and my-listings so they refresh
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "my-listings"],
      });
      queryClient.invalidateQueries({ queryKey: ["marketplace", "listings"] });

      toast.success(res.message || "Listing created successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to create listing");
    },
  });
}
