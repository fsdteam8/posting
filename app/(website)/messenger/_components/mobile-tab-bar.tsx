"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, Phone, Smartphone, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/messenger", icon: MessageSquare, label: "Chats" },
  { href: "/messenger/contacts", icon: Users, label: "Contacts" },
  { href: "/messenger/calls", icon: Phone, label: "Calls" },
  { href: "/messenger/stories", icon: Smartphone, label: "Stories" },
];

interface Props {
  hasMissedCall?: boolean;
}

function isActive(pathname: string, href: string) {
  if (href === "/messenger") {
    // Chats is active only on the index, not on the sibling tabs.
    return (
      pathname === "/messenger" ||
      (pathname.startsWith("/messenger/") &&
        !pathname.startsWith("/messenger/contacts") &&
        !pathname.startsWith("/messenger/calls") &&
        !pathname.startsWith("/messenger/stories"))
    );
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileTabBar({ hasMissedCall }: Props) {
  const pathname = usePathname();
  return (
    <nav className="flex shrink-0 items-center justify-around border-t bg-card md:hidden">
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium transition",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon
              className="size-5"
              strokeWidth={active ? 2.5 : 2}
            />
            {item.label}
            {item.href === "/messenger/calls" && hasMissedCall && (
              <span className="absolute right-1/3 top-1.5 size-1.5 rounded-full bg-destructive" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
