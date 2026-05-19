"use client";

import { Compass, Plus, Settings, ThumbsUp, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/pages", label: "Discover", icon: Compass, exact: true },
  { href: "/pages/liked", label: "Liked Pages", icon: ThumbsUp, exact: false },
  {
    href: "/pages/invitations",
    label: "Invitations",
    icon: Users,
    exact: false,
  },
];

export function PagesSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-70 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-fit sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Pages</h2>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <Settings size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Create Page Button */}
      <Link
        href="/pages/create"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary font-semibold text-sm transition-colors mb-4"
      >
        <Plus size={16} />
        Create Page
      </Link>

      {/* Nav Items */}
      <nav className="space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
