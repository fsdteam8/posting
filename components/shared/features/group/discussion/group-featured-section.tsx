"use client";

import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";

export default function GroupFeaturedSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-lg shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-fb-hover transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-fb-text-primary">
            Featured
          </span>
          <Info className="w-4 h-4 text-fb-text-secondary" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-fb-blue">3 new</span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-fb-text-secondary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-fb-text-secondary" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-fb-hover transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-md bg-fb-bg-wash shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-fb-text-primary">
                  Featured post {item}
                </p>
                <p className="text-[12px] text-fb-text-secondary">
                  2 hours ago
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
