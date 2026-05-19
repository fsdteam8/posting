"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { QUICK_REACTIONS } from "./constants";

interface Props {
  onPick: (emoji: string) => void;
  onMore: () => void;
  onClose: () => void;
}

export function ReactionsBar({ onPick, onMore, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-2 shadow-lg ring-1 ring-black/5"
    >
      {QUICK_REACTIONS.map((r) => (
        <button
          key={r.type}
          type="button"
          onClick={() => onPick(r.emoji)}
          title={r.label}
          className="cursor-pointer text-[18px] transition hover:scale-125"
        >
          {r.emoji}
        </button>
      ))}
      <button
        type="button"
        onClick={onMore}
        className="ml-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/70"
        aria-label="More reactions"
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}
