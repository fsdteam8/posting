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
