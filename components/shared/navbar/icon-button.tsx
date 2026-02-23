"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  badge?: number;
  onClick?: () => void;
  className?: string;
}

export function IconButton({
  icon: Icon,
  label,
  badge,
  onClick,
  className,
}: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={label}
          className={cn(
            "relative flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-border",
            className,
          )}
        >
          <Icon className="size-5" />
          {badge && badge > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-card">
              {badge > 9 ? "9+" : badge}
            </span>
          ) : null}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
