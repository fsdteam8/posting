"use client";

/**
 * ListingImageGallery
 *
 * Displays listing photos as a full-width main image with a scrollable
 * thumbnail strip below. Tapping a thumbnail swaps the main image.
 * Falls back to a placeholder when no photos exist.
 */

import { cn } from "@/lib/utils";
import type { MarketplaceMedia } from "@/types/features/marketplace";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Props = {
  photos: MarketplaceMedia[];
  title: string;
};

export function ListingImageGallery({ photos, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  // ── No photos ─────────────────────────────────────────────────────────────
  if (photos.length === 0) {
    return (
      <div className="w-full aspect-4/3 rounded-xl bg-neutral-100 flex flex-col items-center justify-center gap-2">
        <ImageIcon className="w-10 h-10 text-neutral-300" />
        <p className="text-[12px] text-neutral-400">No photos</p>
      </div>
    );
  }

  function prev() {
    setActiveIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-2">
      {/* ── Main image ──────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 group">
        <Image
          src={photos[activeIndex].url}
          alt={`${title} — photo ${activeIndex + 1}`}
          fill
          className="object-cover"
        />

        {/* Navigation arrows — only shown when more than one photo */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Photo counter pill */}
        {photos.length > 1 && (
          <span className="absolute bottom-2 right-2 text-[11px] font-medium bg-black/50 text-white px-2 py-0.5 rounded-full">
            {activeIndex + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* ── Thumbnail strip ──────────────────────────────────────────────── */}
      {photos.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {photos.map((photo, i) => (
            <button
              key={photo.public_id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                i === activeIndex
                  ? "border-blue-500"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={photo.url}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
