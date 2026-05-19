"use client";

import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  loading,
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <div className="px-5 pb-3 pt-5">
          <h3 className="text-[15px] font-semibold">{title}</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60",
              destructive
                ? "bg-destructive hover:opacity-90"
                : "bg-primary hover:opacity-90",
            )}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
