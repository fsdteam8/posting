import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

// Extend this union as the backend adds more reason codes
export type ReportReason =
  | "misleading_listing"
  | "prohibited_item"
  | "spam"
  | "fraud"
  | "inappropriate_content"
  | "other";

type ReportResponse = {
  success: boolean;
  message: string;
  data: {
    listingId: string;
    reportCount: number;
  };
};

type ReportVariables = {
  listingId: string;
  reason: ReportReason;
  details?: string;
};

/**
 * Reports a marketplace listing.
 *
 * No cache invalidation needed — reportCount is not shown in the UI
 * and re-fetching the listing just to update a hidden counter would be wasteful.
 * The server increments the count and handles moderation internally.
 */
export function useReportListing({ accessToken }: { accessToken: string }) {
  return useMutation<ReportResponse, Error, ReportVariables>({
    mutationKey: ["marketplace", "report-listing"],

    mutationFn: async ({ listingId, reason, details }) => {
      const res = await fetch(
        `${baseURL}/marketplace/listings/${listingId}/report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason, details }),
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

    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message || "Listing reported");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to report listing");
    },
  });
}
