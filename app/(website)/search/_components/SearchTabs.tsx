"use client";

import { SearchType } from "@/types/features/search/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const TABS: { label: string; value: SearchType }[] = [
  { label: "All", value: "all" },
  { label: "Posts", value: "posts" },
  { label: "People", value: "users" },
  { label: "Hashtags", value: "all" }, // static UI tab, no API filter yet
  { label: "Groups", value: "groups" },
  { label: "Events", value: "events" },
];

type Props = {
  activeType: SearchType;
  query: string;
};

export default function SearchTabs({ activeType, query }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (type: SearchType) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", query);
      params.set("type", type);
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams, query],
  );

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center bg-[#F0F2F5] rounded-full p-1 gap-0.5">
        {TABS.map((tab) => {
          // const isActive =
          //   activeType === tab.value && tab.value !== "all"
          //     ? activeType === tab.value
          //     : tab.value === "all" && activeType === "all";

          const active =
            tab.value === "all"
              ? activeType === "all"
              : activeType === tab.value;

          return (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.value)}
              className={`
                relative px-4 py-1.5 rounded-full text-sm font-medium
                transition-all duration-300 ease-in-out whitespace-nowrap
                ${
                  active
                    ? "bg-[#1877F2] text-white shadow-md scale-[1.02]"
                    : "text-[#65676B] hover:bg-white/60 hover:text-[#1C1E21]"
                }
              `}
              style={{
                transitionProperty:
                  "background-color, color, transform, box-shadow",
              }}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
