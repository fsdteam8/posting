"use client";

import { useCreateGroupAlbum } from "@/hooks/features/groups/api/media/use-create-group-album";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  groupId: string;
  accessToken: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateAlbumModal({
  groupId,
  accessToken,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending, isError, error, reset } = useCreateGroupAlbum({
    groupId,
    accessToken,
  });

  const handleClose = useCallback(() => {
    if (isPending) return;
    onClose();
  }, [isPending, onClose]);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, handleClose]);

  const handleSubmit = () => {
    if (!title.trim() || isPending) return;
    mutate(
      { title: title.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ImagePlus size={16} className="text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                Create Album
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isPending}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Album title <span className="text-red-400">*</span>
              </label>
              <input
                ref={(node) => {
                  (
                    titleRef as React.MutableRefObject<HTMLInputElement | null>
                  ).current = node;
                  node?.focus();
                }}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Summer Trip 2026"
                maxLength={100}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-muted text-foreground placeholder:text-muted-foreground disabled:opacity-60 transition"
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/100
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this album about?"
                rows={3}
                maxLength={500}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-muted text-foreground placeholder:text-muted-foreground resize-none disabled:opacity-60 transition"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </p>
            </div>

            {/* Error */}
            {isError && (
              <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
                {(error as Error)?.message ??
                  "Something went wrong. Please try again."}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-4 bg-muted/50 border-t border-border">
            <button
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? "Creating…" : "Create Album"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
