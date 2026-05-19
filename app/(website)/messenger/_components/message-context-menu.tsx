"use client";

import { cn } from "@/lib/utils";
import { Copy, Forward, Reply, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  x: number;
  y: number;
  isMine: boolean;
  onClose: () => void;
  onReply: () => void;
  onCopy: () => void;
  onForward: () => void;
  onDelete: () => void;
}

export function MessageContextMenu({
  x,
  y,
  isMine,
  onClose,
  onReply,
  onCopy,
  onForward,
  onDelete,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const baseItems = [
    { key: "reply", label: "Reply", icon: Reply, onClick: onReply },
    { key: "copy", label: "Copy", icon: Copy, onClick: onCopy },
    { key: "forward", label: "Forward", icon: Forward, onClick: onForward },
  ];

  return (
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className="fixed z-50 min-w-37.5 rounded-xl border bg-card p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95"
    >
      {baseItems.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={() => {
            it.onClick();
            onClose();
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
        >
          <it.icon className="size-4" />
          {it.label}
        </button>
      ))}
      {isMine && (
        <button
          type="button"
          onClick={() => {
            onDelete();
            onClose();
          }}
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
            "text-destructive hover:bg-destructive/10",
          )}
        >
          <Trash2 className="size-4" />
          Delete
        </button>
      )}
    </div>
  );
}
