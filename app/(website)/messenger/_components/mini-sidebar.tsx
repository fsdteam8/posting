"use client";

import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Phone,
  Plus,
  Settings,
  Smartphone,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "./avatar";

interface Props {
  avatarUrl: string;
  hasMissedCall?: boolean;
  onCreateClick?: () => void;
}

const TOP_ITEMS = [
  { href: "/messenger", icon: MessageSquare, label: "Chats", matchPrefix: true },
  { href: "/messenger/contacts", icon: Users, label: "Contacts" },
  { href: "/messenger/calls", icon: Phone, label: "Calls", hasDot: true },
];

const BOTTOM_ITEMS = [
  { href: "/messenger/favorites", icon: Star, label: "Favorites" },
  { href: "/messenger/stories", icon: Smartphone, label: "Stories" },
  { href: "/messenger/settings", icon: Settings, label: "Settings" },
];

function isActive(pathname: string, href: string, prefix?: boolean) {
  if (prefix) {
    // /messenger is active for /messenger and /messenger/<id> but not /messenger/calls, etc.
    if (pathname === "/messenger") return true;
    return (
      pathname.startsWith("/messenger/") &&
      !pathname.startsWith("/messenger/calls") &&
      !pathname.startsWith("/messenger/stories") &&
      !pathname.startsWith("/messenger/contacts") &&
      !pathname.startsWith("/messenger/favorites") &&
      !pathname.startsWith("/messenger/settings")
    );
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function MiniSidebar({
  avatarUrl,
  hasMissedCall,
  onCreateClick,
}: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-18 shrink-0 flex-col items-center border-r bg-card py-4">
      <Link
        href="/profile"
        aria-label="Profile"
        className="relative mb-4 size-10 cursor-pointer overflow-hidden rounded-full ring-2 ring-transparent transition hover:ring-primary/30"
      >
        <Avatar src={avatarUrl} alt="Profile" sizes="40px" />
      </Link>

      <div className="mb-4 h-px w-8 bg-border" />

      <nav className="flex flex-col items-center gap-2">
        {TOP_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.matchPrefix);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "relative flex size-10 cursor-pointer items-center justify-center rounded-full transition",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon
                className="size-5"
                strokeWidth={active ? 2.5 : 2}
              />
              {item.hasDot && hasMissedCall && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="my-4 h-px w-8 bg-border" />

      <nav className="flex flex-col items-center gap-2">
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex size-10 cursor-pointer items-center justify-center rounded-full transition",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="size-5" strokeWidth={active ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onCreateClick}
        aria-label="New conversation"
        className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-90"
      >
        <Plus className="size-5" />
      </button>
    </aside>
  );
}
