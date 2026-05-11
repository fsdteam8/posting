"use client";

import { cn } from "@/lib/utils";
import { ListingStatus } from "@/types/features/marketplace";
import {
  Car,
  ChevronRight,
  Home,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  Zap,
} from "lucide-react";

const CATEGORIES = [
  "Vehicles",
  "Property Rentals",
  "Apparel",
  "Classifieds",
  "Electronics",
  "Entertainment",
  "Family",
  "Free Stuff",
  "Garden & Outdoor",
  "Hobbies",
  "Home Goods",
  "Home Improvement Supplies",
  "Home Sales",
  "Musical Instruments",
  "Office Supplies",
  "Pet Supplies",
  "Sporting Goods",
  "Toys & Games",
  "Buy and sell groups",
];

type Props = {
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  activeStatus: ListingStatus | null;
  onStatusChange: (s: ListingStatus | null) => void;
  onCreateClick: () => void;
  onMyListingsClick: () => void;
};

export function MarketplaceSidebar({
  activeCategory,
  onCategoryChange,
  onCreateClick,
  onMyListingsClick,
}: Props) {
  return (
    <aside className="w-55 shrink-0 hidden md:flex flex-col gap-1 border-r border-neutral-100 pr-3 py-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[13px] font-semibold text-neutral-800">
          Marketplace
        </span>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-3 h-3" />
          New
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 mb-3">
        {[
          { label: "Browse all", icon: ShoppingBag, value: null },
          { label: "Notifications", icon: Zap, value: "notifications" },
          { label: "Inbox", icon: Tag, value: "inbox" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.value === null) onCategoryChange(null);
            }}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors w-full text-left",
              activeCategory === item.value &&
                "bg-blue-50 text-blue-700 font-medium",
            )}
          >
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            {item.label}
          </button>
        ))}

        <button
          onClick={onMyListingsClick}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors w-full text-left"
        >
          <Package className="w-3.5 h-3.5 shrink-0" />
          Your listings
        </button>
      </nav>

      {/* Create listing CTA */}
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 mx-1 mb-3 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Create new listing
      </button>

      <div className="px-1 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          Top categories
        </span>
      </div>

      {[
        { label: "Vehicles", icon: Car },
        { label: "Home Sales", icon: Home },
        { label: "Electronics", icon: Zap },
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => onCategoryChange(item.label)}
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors w-full text-left",
            activeCategory === item.label &&
              "bg-blue-50 text-blue-700 font-medium",
          )}
        >
          <item.icon className="w-3.5 h-3.5 shrink-0" />
          {item.label}
        </button>
      ))}

      <div className="px-1 mt-2 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          All categories
        </span>
      </div>

      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            "flex items-center justify-between px-2 py-1.5 rounded-md text-[12px] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors w-full text-left group",
            activeCategory === cat && "bg-blue-50 text-blue-700 font-medium",
          )}
        >
          <span>{cat}</span>
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </aside>
  );
}
