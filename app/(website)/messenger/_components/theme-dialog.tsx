"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";
import { THEMES } from "./constants";

interface Props {
  open: boolean;
  conversationId: string | null;
  currentTheme?: string;
  onClose: () => void;
  onSelect: (themeId: string) => void;
}

export function ThemeDialog({
  open,
  conversationId,
  currentTheme,
  onClose,
  onSelect,
}: Props) {
  const [selected, setSelected] = useState<string>(currentTheme || "default");

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-[15px] font-semibold">Theme</h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelected(t.id);
                  if (conversationId) onSelect(t.id);
                }}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-xl border transition",
                  selected === t.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-border",
                )}
              >
                <div
                  className={cn(
                    "relative aspect-4/3 bg-linear-to-br",
                    t.color,
                  )}
                />
                <div className="bg-card px-3 py-2 text-left">
                  <p className="truncate text-[12px] font-medium">{t.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
