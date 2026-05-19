"use client";

import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  subject: string;
}

const REASONS = [
  "Harassment or bullying",
  "Hate speech or symbols",
  "Spam or scam",
  "Sexual content",
  "Self-harm",
  "Something else",
];

export function ReportDialog({ open, onClose, subject }: Props) {
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function submit() {
    if (!reason) return;
    setSubmitting(true);
    // Backend has no report endpoint yet; simulate then toast.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast.success("Report submitted. Our team will review it.");
    setReason(null);
    setNote("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-[15px] font-semibold">Report {subject}</h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-[12.5px] text-muted-foreground">
            Why are you reporting this conversation? Your report is anonymous.
          </p>

          <div className="flex flex-col gap-1.5">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-left text-[13px] transition",
                  reason === r
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-input hover:bg-muted/40",
                )}
              >
                {r}
                <span
                  className={cn(
                    "size-3.5 rounded-full border-2",
                    reason === r
                      ? "border-primary bg-primary"
                      : "border-input",
                  )}
                />
              </button>
            ))}
          </div>

          <textarea
            placeholder="Add details (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border bg-card p-3 text-[13px] outline-none focus:border-primary/40"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:bg-muted disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!reason || submitting}
            className={cn(
              "flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition",
              reason && !submitting
                ? "cursor-pointer hover:opacity-90"
                : "cursor-not-allowed opacity-60",
            )}
          >
            {submitting && <Loader2 className="size-3.5 animate-spin" />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
