"use client";

import { Home, MonitorPlay, Store, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "./nav-icon";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/reels", icon: MonitorPlay, label: "Reels" },
  { href: "/marketplace", icon: Store, label: "Marketplace" },
  { href: "/groups", icon: Users, label: "Groups" },
  //   { href: "/gaming", icon: Gamepad2, label: "Gaming" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    // Exact match for root, prefix match for everything else
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="flex flex-1 items-center justify-center"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-1 md:gap-14 ">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} aria-label={item.label}>
            <NavIcon
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
            />
          </Link>
        ))}
      </div>
    </nav>
  );
}
