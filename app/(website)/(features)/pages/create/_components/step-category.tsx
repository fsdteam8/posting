"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

const POPULAR_CATEGORIES = [
  "Musician/Band",
  "Health/Beauty",
  "Supermarket/Convenience Store",
  "Restaurant/Café",
  "Clothing Store",
  "Education",
  "Technology",
  "Sports",
  "Entertainment",
  "Non-profit Organisation",
  "Local Business",
  "Community",
  "Arts & Entertainment",
  "Travel & Leisure",
  "Automotive",
];

interface StepCategoryProps {
  pageName: string;
  value: string;
  onChange: (value: string) => void;
}

export function StepCategory({ pageName, value, onChange }: StepCategoryProps) {
  const [search, setSearch] = useState("");

  const filtered = POPULAR_CATEGORIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Finish setting up your Page
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Success! You&apos;ve created{" "}
          <span className="font-medium text-gray-700">{pageName}</span>. Now add
          more details to help people connect with you.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for Categories"
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Selected badge */}
      {value && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Selected:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
            {value}
            <button onClick={() => onChange("")}>
              <X size={12} />
            </button>
          </span>
        </div>
      )}

      {/* Popular categories */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          Popular categories
        </p>
        <div className="flex flex-wrap gap-2">
          {filtered.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                value === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {cat}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400">No categories found</p>
          )}
        </div>
      </div>
    </div>
  );
}
