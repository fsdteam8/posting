"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

import { useProfile } from "@/hooks/profile/use-profile";

type SidebarItem = {
  icon: string | StaticImageData;
  label: string;
  href: string;
  iconClassName?: string;
};

const mainItems: SidebarItem[] = [
  { icon: "/home/icons/groups.png", label: "Groups", href: "/groups" },
  { icon: "/home/icons/play.png", label: "Reels", href: "/reels" },
  { icon: "/home/icons/bookmark.png", label: "Save", href: "/saved" },
  { icon: "/home/icons/pages.png", label: "Pages", href: "/pages" },
  { icon: "/home/icons/events.png", label: "Event", href: "/events" },
  { icon: "/home/icons/birthday.png", label: "Birthday", href: "/birthday" },
  { icon: "/home/icons/clock.png", label: "Memories", href: "/memories" },
  { icon: "/home/icons/spaces.png", label: "Spaces", href: "/spaces" },
];

const expandedItems: SidebarItem[] = [
  { icon: "/home/icons/offers.png", label: "Offers", href: "/offers" },
  { icon: "/home/icons/poke.png", label: "Poke's", href: "/pokes" },
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
    <aside className="w-full py-4">
      {/* User Profile */}
      <Link
        href="/profile"
        className={cn(
          "mb-4 flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-muted/50",
        )}
      >
        <Avatar className="size-10 ring-1 ring-border">
          <AvatarImage src={USER.avatarUrl} alt={USER.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {USER.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <span className="text-[15px] font-semibold text-foreground">
          {USER.name}
        </span>
      </Link>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 gap-3">
        {mainItems.map((item) => (
          <SidebarCard
            key={item.label}
            item={item}
            active={pathname === item.href}
          />
        ))}

        {expanded &&
          expandedItems.map((item) => (
            <SidebarCard
              key={item.label}
              item={item}
              active={pathname === item.href}
            />
          ))}
      </div>

      {/* See More / Less */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "mt-5 flex h-10 w-full items-center justify-center rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground transition hover:bg-muted/60",
        )}
      >
        {expanded ? (
          <>
            <ChevronUp className="mr-1 size-4" />
            See Less
          </>
        ) : (
          <>
            <ChevronDown className="mr-1 size-4" />
            See More
          </>
        )}
      </button>
    </aside>
  );
}

function SidebarCard({ item, active }: { item: SidebarItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex h-23.75 flex-col items-center justify-center rounded-2xl border bg-background p-3 text-center shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:shadow-md",
        active && "border-primary/30 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "mb-2 flex size-11 items-center justify-center rounded-xl transition",
          active ? "bg-primary/10" : "bg-transparent",
        )}
      >
        <Image
          src={item.icon}
          alt={item.label}
          width={30}
          height={30}
          className={cn(
            "object-contain opacity-90 transition group-hover:opacity-100",
            active && "opacity-100",
          )}
        />
      </div>

      <span
        className={cn(
          "text-[14px] font-medium leading-none transition",
          active ? "text-primary" : "text-foreground",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
