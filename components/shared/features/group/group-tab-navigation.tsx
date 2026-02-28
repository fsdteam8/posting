"use client";

import { SpotlightNavbar } from "@/components/ui/spot-light-navbar";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";

export default function GroupTabNavigation({
  groupId,
}: {
  children: React.ReactNode;
  groupId: string;
}) {
  const router = useRouter();

  // active child segment under /groups/view/[groupId]
  // null means you are at /groups/view/[groupId] (the index page)
  const segment = useSelectedLayoutSegment(); // "about" | "discussion" | "members" | "media" | null

  const base = `/groups/view/${groupId}`;

  const navItems = [
    { label: "About", href: `${base}/about` },
    { label: "Discussion", href: base }, // index

    { label: "Featured", href: `${base}/announcements` },
    { label: "People", href: `${base}/members` },
    { label: "Media", href: `${base}/media` },
  ];

  const activeKey = segment ?? "overview";

  const defaultIndex = navItems.findIndex((item) => {
    if (item.href === base) return activeKey === "overview";
    return item.href.endsWith(`/${activeKey}`);
  });

  const handleNavClick = (item: { href: string }) => {
    router.push(item.href, { scroll: false });
  };

  return (
    <div>
      <SpotlightNavbar
        items={navItems}
        onItemClick={handleNavClick}
        defaultActiveIndex={defaultIndex !== -1 ? defaultIndex : 0}
      />
    </div>
  );
}
