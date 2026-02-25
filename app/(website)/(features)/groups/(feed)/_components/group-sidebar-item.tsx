"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface GroupsSidebarItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
}

export function GroupsSidebarItem({
  href,
  label,
  isActive,
  icon: Icon,
  onClick,
}: GroupsSidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-150 relative",
        isActive
          ? "text-foreground bg-muted"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
      )}
    >
      {/* {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full" />
      )} */}
      {Icon && (
        <span
          className={cn(
            "shrink-0 text-base p-1 rounded-full",
            isActive && "bg-primary",
          )}
        >
          <Icon className={cn("w-4 h-4", isActive && "text-white")} />
        </span>
      )}
      <span className="truncate">{label}</span>
    </Link>
  );
}
