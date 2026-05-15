import type { OfferStatus } from "@/hooks/features/notifications/api/useGetMyOffers";
import { cn } from "@/lib/utils";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OfferStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className: "bg-amber-50  text-amber-700  border-amber-100",
    },
    accepted: {
      label: "Accepted",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-50    text-red-600    border-red-100",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-neutral-100 text-neutral-500 border-neutral-200",
    },
    countered: {
      label: "Countered",
      className: "bg-purple-50 text-purple-700 border-purple-100",
    },
    expired: {
      label: "Expired",
      className: "bg-neutral-100 text-neutral-400 border-neutral-200",
    },
  };

type Props = {
  status: OfferStatus;
  className?: string;
};

export function OfferStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.expired;

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full border",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
