"use client";

/**
 * ListingActionsBar
 *
 * The action row shown below the price: Save, Hide, Share, Report.
 * Each button calls the relevant mutation hook.
 * Hidden entirely when the viewer is the seller (they can't save/report
 * their own listing).
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHideListing } from "@/hooks/features/notifications/api/useHideListing";
import {
  useReportListing,
  type ReportReason,
} from "@/hooks/features/notifications/api/useReportListing";
import { useSaveListing } from "@/hooks/features/notifications/api/useSaveListing";
import {
  Bookmark,
  BookmarkCheck,
  EyeOff,
  Flag,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Report reasons ───────────────────────────────────────────────────────────

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "misleading_listing", label: "Misleading listing" },
  { value: "prohibited_item", label: "Prohibited item" },
  { value: "spam", label: "Spam" },
  { value: "fraud", label: "Fraud" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "other", label: "Other" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  listingId: string;
  accessToken: string;
  isSaved: boolean; // whether the current user has saved this listing
  isHidden: boolean; // whether the current user has hidden this listing
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ListingActionsBar({
  listingId,
  accessToken,
  isSaved: initialSaved,
  isHidden: initialHidden,
}: Props) {
  // Optimistic local state — flips immediately on click, reverts on error
  const [saved, setSaved] = useState(initialSaved);
  const [hidden, setHidden] = useState(initialHidden);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | "">("");
  const [reportDetails, setReportDetails] = useState("");

  // Re-sync with server truth when the listing refetches after a mutation.
  // useState(initial) only reads the prop once on mount, so without this the
  // local state can drift if the optimistic toggle disagrees with the server.
  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);
  useEffect(() => {
    setHidden(initialHidden);
  }, [initialHidden]);

  const { mutate: saveListing, isPending: isSaving } = useSaveListing({
    accessToken,
  });
  const { mutate: hideListing, isPending: isHiding } = useHideListing({
    accessToken,
  });
  const { mutate: reportListing, isPending: isReporting } = useReportListing({
    accessToken,
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleSave() {
    setSaved((v) => !v); // optimistic
    saveListing(listingId, {
      onError: () => setSaved((v) => !v), // revert on failure
    });
  }

  function handleHide() {
    setHidden((v) => !v);
    hideListing(listingId, {
      onError: () => setHidden((v) => !v),
    });
  }

  function handleShare() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  }

  function handleReport() {
    if (!reportReason) return;

    reportListing(
      {
        listingId,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setReportOpen(false);
            setReportReason("");
            setReportDetails("");
          }
        },
      },
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Save */}
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-2 flex-1 text-[12.5px] ${saved ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" : ""}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {saved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          {saved ? "Saved" : "Save"}
        </Button>

        {/* Share */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 flex-1 text-[12.5px]"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={handleHide}
              disabled={isHiding}
              className="text-[12.5px] gap-2"
            >
              <EyeOff className="w-3.5 h-3.5" />
              {hidden ? "Unhide listing" : "Hide listing"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setReportOpen(true)}
              className="text-[12.5px] gap-2 text-red-600 focus:text-red-600"
            >
              <Flag className="w-3.5 h-3.5" />
              Report listing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Report dialog ──────────────────────────────────────────────── */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-sm p-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-neutral-100">
            <DialogTitle className="text-[14px] font-semibold">
              Report listing
            </DialogTitle>
          </DialogHeader>

          <div className="px-5 py-4 space-y-3">
            <p className="text-[12px] text-neutral-500">
              Help us understand what is wrong with this listing.
            </p>

            <Select
              value={reportReason}
              onValueChange={(v) => setReportReason(v as ReportReason)}
            >
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem
                    key={r.value}
                    value={r.value}
                    className="text-[12.5px]"
                  >
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Additional details (optional)"
              className="resize-none text-[12.5px] min-h-18"
              rows={3}
            />

            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[12.5px]"
                onClick={() => setReportOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-[12.5px] bg-red-600 hover:bg-red-700"
                onClick={handleReport}
                disabled={isReporting || !reportReason}
              >
                {isReporting ? "Reporting..." : "Submit report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
