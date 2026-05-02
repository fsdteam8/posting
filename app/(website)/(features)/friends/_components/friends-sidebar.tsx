"use client";

import { cn } from "@/lib/utils";
import { Cake, Home, Lightbulb, List, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/friends", icon: Home },
  { label: "Friend Requests", href: "/friends/requests", icon: UserCheck },
  { label: "Suggestions", href: "/friends/suggestions", icon: Lightbulb },
  { label: "All Friends", href: "/friends/all", icon: Users },
  { label: "Birthdays", href: "/friends/birthdays", icon: Cake },
  { label: "Custom List", href: "/friends/lists", icon: List },
];

/** Shown on md+ screens as a left sidebar inside the flex row */
export function FriendsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col gap-1 py-4">
      <h2 className="text-xl font-bold px-3 mb-2">Friends</h2>

      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </aside>
  );
}

/** Shown on mobile only — sticky horizontal scroll bar above the content */
export function FriendsMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex overflow-x-auto scrollbar-hide gap-1 px-3 py-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
