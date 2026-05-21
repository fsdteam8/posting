"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Film,
  Flag,
  Menu,
  MessageCircle,
  PenSquare,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MobileMenuProps {
  messengerUnread: number;
  notificationUnread: number;
  onPostClick?: () => void;
}

interface ItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  href?: string;
  onClick?: () => void;
  swatch?: string;
}

function Item({ icon: Icon, label, badge, href, onClick, swatch }: ItemProps) {
  const swatchClass = swatch ?? "bg-muted text-foreground";
  const inner = (
    <>
      <span
        className={`relative flex size-9 shrink-0 items-center justify-center rounded-full ${swatchClass}`}
      >
        <Icon className="size-5" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center leading-none">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </>
  );

  const className =
    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary";

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

export function MobileMenu({
  messengerUnread,
  notificationUnread,
  onPostClick,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
        >
          <Menu className="size-5" />
          {messengerUnread + notificationUnread > 0 && (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-[min(18rem,calc(100vw-1.5rem))] rounded-xl border bg-card p-2 shadow-xl"
      >
        <SectionLabel>Create</SectionLabel>
        <div className="flex flex-col">
          <Item
            icon={PenSquare}
            label="Post"
            swatch="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
            onClick={() => {
              close();
              onPostClick?.();
            }}
          />
          <Item
            icon={Film}
            label="Story"
            swatch="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950 dark:text-fuchsia-400"
            href="/stories/create"
            onClick={close}
          />
          <Item
            icon={Flag}
            label="Page"
            swatch="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
            href="/pages/create"
            onClick={close}
          />
          <Item
            icon={Users}
            label="Group"
            swatch="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
            href="/groups/create"
            onClick={close}
          />
          <Item
            icon={Store}
            label="Listing"
            swatch="bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
            href="/marketplace/create"
            onClick={close}
          />
        </div>

        <SectionLabel>Inbox</SectionLabel>
        <div className="flex flex-col">
          <Item
            icon={MessageCircle}
            label="Messages"
            badge={messengerUnread}
            href="/messenger"
            onClick={close}
          />
          <Item
            icon={Bell}
            label="Notifications"
            badge={notificationUnread}
            href="/notifications"
            onClick={close}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
