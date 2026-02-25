"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Flame,
  MoreHorizontal,
  Newspaper,
  Star,
} from "lucide-react";

import { useProfile } from "@/hooks/profile/use-profile";

type SidebarItem = {
  icon: string | StaticImageData; // local image src (from import)
  label: string;
  href: string;
  iconClassName?: string;
};

const mainItems: SidebarItem[] = [
  { icon: "/home/icons/play.png", label: "Watch", href: "/reels" },
  { icon: "/home/icons/events.png", label: "Events", href: "/events" },
  { icon: "/home/icons/friends.png", label: "Friends", href: "/friends" },
  { icon: "/home/icons/clock.png", label: "Memories", href: "/memories" },
];

const expandedItems: SidebarItem[] = [
  { icon: "/home/icons/bookmark.png", label: "Saved", href: "/saved" },
  { icon: "/home/icons/groups.png", label: "Groups", href: "/groups" },
];

interface ShortcutItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  href: string;
}

const shortcuts: ShortcutItem[] = [
  {
    icon: Flame,
    label: "Most Visited Group",
    color: "bg-orange-100 text-orange-600",
    href: "/groups/most-visited",
  },
  {
    icon: Star,
    label: "Recently Active",
    color: "bg-yellow-100 text-yellow-600",
    href: "/groups/recent",
  },
  {
    icon: Newspaper,
    label: "Groups New Posts",
    color: "bg-blue-100 text-primary",
    href: "/groups/new-posts",
  },
  {
    icon: Bookmark,
    label: "Saved Items",
    color: "bg-pink-100 text-pink-600",
    href: "/saved",
  },
  {
    icon: CalendarDays,
    label: "Events this Week",
    color: "bg-red-100 text-red-500",
    href: "/events/week",
  },
];

interface Props {
  accessToken: string;
}

export default function LeftSidebar({ accessToken }: Props) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  const { data: profile } = useProfile(accessToken);

  const USER = {
    name: profile ? `${profile.firstName} ${profile.lastName}` : "...",
    avatarUrl:
      profile?.profileImage?.url ||
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.firstName}&backgroundColor=b6e3f4`,
  };

  return (
    <aside className="flex flex-col gap-2 py-4 pr-2">
      {/* User Profile */}
      <Link
        href="/profile"
        className={cn(
          "group flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors",
          "hover:bg-muted/60",
        )}
      >
        <Avatar className="size-9 ring-1 ring-border group-hover:ring-primary/30 transition">
          <AvatarImage src={USER.avatarUrl} alt={USER.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {USER.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <span className="text-[15px] font-semibold text-foreground">
          {USER.name}
        </span>
      </Link>

      {/* Main Nav Items */}
      {mainItems.map((item) => (
        <SidebarRow
          key={item.label}
          item={item}
          active={pathname === item.href}
        />
      ))}

      {/* Expandable Items */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          {expandedItems.map((item) => (
            <SidebarRow
              key={item.label}
              item={item}
              active={pathname === item.href}
            />
          ))}
        </div>
      </div>

      {/* See More / Less */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors",
          "hover:bg-muted/60",
        )}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-muted/40 text-foreground">
          {expanded ? (
            <ChevronUp className="size-5" />
          ) : (
            <ChevronDown className="size-5" />
          )}
        </span>
        <span className="text-[15px] font-medium text-foreground">
          {expanded ? "See Less" : "See More"}
        </span>
      </button>

      {/* Separator */}
      <div className="mx-2 my-1 border-t border-border" />

      {/* Shortcuts Section */}
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[17px] font-semibold text-foreground">
          Shortcuts
        </span>
        <button className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {shortcuts.map((shortcut) => (
        <Link
          key={shortcut.label}
          href={shortcut.href}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors",
            "hover:bg-muted/60",
          )}
        >
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              shortcut.color,
            )}
          >
            <shortcut.icon className="size-5" />
          </span>
          <span className="text-[14px] font-medium text-foreground group-hover:text-foreground">
            {shortcut.label}
          </span>
        </Link>
      ))}

      {/* See More for shortcuts */}
      <button className="flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/60">
        <span className="flex size-9 items-center justify-center rounded-full bg-muted/40 text-foreground">
          <ChevronDown className="size-5" />
        </span>
        <span className="text-[15px] font-medium text-foreground">
          See More
        </span>
      </button>
    </aside>
  );
}

function SidebarRow({ item, active }: { item: SidebarItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-all",
        active ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/60",
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg transition",
          active ? "bg-primary/10" : "bg-transparent",
        )}
      >
        <Image
          src={item.icon}
          alt={item.label}
          width={22}
          height={22}
          className={cn(
            "opacity-90 transition group-hover:opacity-100",
            active && "opacity-100",
          )}
        />
      </span>

      <span
        className={cn(
          "text-[15px] font-medium transition",
          active ? "text-primary" : "text-foreground",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
