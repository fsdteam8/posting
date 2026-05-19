"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Film,
  Flag,
  PenSquare,
  Plus,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";

interface CreateMenuProps {
  onPostClick: () => void;
  /**
   * Optional custom trigger. If omitted, renders a default plus-icon button
   * that matches the navbar IconButton styling.
   */
  trigger?: ReactNode;
  /**
   * Where to anchor the popover. Defaults to "end" for the right-aligned
   * navbar button. Use "start" for left-aligned launchers.
   */
  align?: "start" | "center" | "end";
}

type Item = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind classes for the colored icon swatch */
  swatch: string;
} & ({ href: string; action?: never } | { href?: never; action: () => void });

export function CreateMenu({
  onPostClick,
  trigger,
  align = "end",
}: CreateMenuProps) {
  const [open, setOpen] = useState(false);

  const items: Item[] = [
    {
      icon: PenSquare,
      title: "Post",
      description: "Share an update, photo, or video with your network",
      swatch: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
      action: () => {
        setOpen(false);
        onPostClick();
      },
    },
    {
      icon: Film,
      title: "Story",
      description: "Share a moment that disappears in 24 hours",
      swatch:
        "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950 dark:text-fuchsia-400",
      href: "/stories/create",
    },
    {
      icon: Flag,
      title: "Page",
      description: "Create a profile for a brand, business, or cause",
      swatch:
        "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      href: "/pages/create",
    },
    {
      icon: Users,
      title: "Group",
      description: "Bring people together around a shared interest",
      swatch:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
      href: "/groups/create",
    },
    {
      icon: Store,
      title: "Listing",
      description: "Sell something on Postin Marketplace",
      swatch: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
      href: "/marketplace/create",
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label="Create"
            className="relative p-2 rounded-full hover:bg-muted transition-colors data-[state=open]:bg-muted"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={10}
        collisionPadding={12}
        className="w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border bg-card p-2 shadow-2xl"
      >
        <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Create
        </div>

        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const inner = (
              <>
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.swatch}`}
                >
                  <item.icon className="size-5" />
                </span>
                <span className="flex flex-col min-w-0 text-left">
                  <span className="text-[14px] font-semibold text-foreground leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[12px] text-muted-foreground leading-snug line-clamp-2">
                    {item.description}
                  </span>
                </span>
              </>
            );

            const className =
              "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none";

            return (
              <li key={item.title}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={className}
                    onClick={() => setOpen(false)}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={className}
                    onClick={item.action}
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
