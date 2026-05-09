"use client";

import type { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  badge?: number;
  onClick?: () => void;
}

export function IconButton({
  icon: Icon,
  label,
  badge,
  onClick,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-muted transition-colors"
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-1 min-w-4 h-4 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
