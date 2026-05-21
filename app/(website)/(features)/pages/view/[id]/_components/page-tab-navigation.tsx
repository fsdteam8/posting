"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  pageId: string;
}

export function PageTabNavigation({ pageId }: Props) {
  const pathname = usePathname();
  const base = `/pages/view/${pageId}`;

  const tabs = [
    { label: "Posts", href: base, exact: true },
    { label: "About", href: `${base}/about` },
    { label: "Videos", href: `${base}/videos` },
    { label: "Photos", href: `${base}/photos` },
    { label: "Events", href: `${base}/events` },
    { label: "Channels", href: `${base}/channels` },
  ];

  return (
    <div className="border-t border-gray-100 px-3">
      <nav className="flex items-center gap-1 flex-wrap">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "relative px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
                active
                  ? "text-primary"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md",
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute left-2 right-2 bottom-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
