"use client";

import { cn } from "@/lib/utils";

interface InterestChipProps {
  emoji: string;
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function InterestChip({
  emoji,
  label,
  selected,
  onToggle,
}: InterestChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer select-none",
        selected
          ? "border-primary bg-primary/5 text-foreground shadow-sm scale-105"
          : "border-border bg-card text-foreground hover:border-muted-foreground/40 hover:bg-muted/50",
      )}
    >
      <span className="text-base" aria-hidden="true">
        {emoji}
      </span>
      <span>{label}</span>
    </button>
  );
}
