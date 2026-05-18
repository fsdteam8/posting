"use client";

import type { Conversation } from "@/types/messenger";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "./avatar";
import { getUserAvatar, userFullName } from "./helpers";

interface Props {
  open: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  meId: string;
  initialMap?: Record<string, string>;
  onSave: (map: Record<string, string>) => void;
}

export function NicknamesDialog({
  open,
  onClose,
  conversation,
  meId,
  initialMap,
  onSave,
}: Props) {
  const [nicknames, setNicknames] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (conversation) {
      for (const p of conversation.participants) {
        init[p._id] = initialMap?.[p._id] || userFullName(p);
      }
    }
    return init;
  });

  if (!open || !conversation) return null;

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
          <h3 className="flex-1 text-center text-[15px] font-semibold">
            Nicknames
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {conversation.participants.map((p) => (
            <div key={p._id} className="flex items-center gap-3">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                <Avatar
                  src={getUserAvatar(p)}
                  alt={userFullName(p)}
                  sizes="36px"
                />
              </div>
              <input
                value={nicknames[p._id] || ""}
                onChange={(e) =>
                  setNicknames((n) => ({ ...n, [p._id]: e.target.value }))
                }
                className="h-10 flex-1 rounded-lg border bg-card px-3 text-[13px] outline-none focus:border-primary/40"
                title={p._id === meId ? "You" : userFullName(p)}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(nicknames)}
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:opacity-90"
          >
            <Check className="size-3.5" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
