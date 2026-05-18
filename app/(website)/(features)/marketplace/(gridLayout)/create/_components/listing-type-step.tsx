"use client";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { ListingType } from "@/types/features/marketplace";

import { LISTING_TYPES } from "./constants";

type Props = {
  onSelect: (type: ListingType) => void;
};

export default function ListingTypeStep({ onSelect }: Props) {
  return (
    <div className="grid gap-3">
      {LISTING_TYPES.map((lt) => (
        <button
          key={lt.value}
          type="button"
          onClick={() => onSelect(lt.value)}
          className={cn(
            "group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
            "hover:border-primary/30 hover:bg-muted/40",
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
            <lt.icon className="size-5 text-muted-foreground group-hover:text-primary" />
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-semibold">{lt.label}</h4>

            <p className="mt-1 text-xs text-muted-foreground">
              {lt.description}
            </p>
          </div>

          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
