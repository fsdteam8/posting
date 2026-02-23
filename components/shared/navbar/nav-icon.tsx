"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavIconProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function NavIcon({ icon: Icon, label, active, onClick }: NavIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={label}
          className={cn(
            "relative flex h-12 items-center justify-center rounded-lg px-6 transition-colors lg:px-8",
            "hover:bg-secondary",
            active &&
              "text-primary after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.75 after:rounded-t-full after:bg-primary",
            !active && "text-muted-foreground",
          )}
        >
          <Icon className="size-6" strokeWidth={active ? 2.5 : 1.75} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
