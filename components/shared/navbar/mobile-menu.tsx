"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Menu, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MobileMenuProps {
  messengerUnread: number;
  notificationUnread: number;
  onCreate?: () => void;
}

interface ItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  href?: string;
  onClick?: () => void;
}

function Item({ icon: Icon, label, badge, href, onClick }: ItemProps) {
  const inner = (
    <>
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-foreground" />
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

export function MobileMenu({
  messengerUnread,
  notificationUnread,
  onCreate,
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
        className="w-64 rounded-xl border bg-card p-2 shadow-xl"
      >
        <div className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Menu
        </div>
        <div className="flex flex-col">
          <Item
            icon={Plus}
            label="Create"
            onClick={() => {
              onCreate?.();
              close();
            }}
          />
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
