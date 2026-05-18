/**
 * ListingDetailSkeleton
 *
 * Shown while useGetListing is loading. Mirrors the exact layout of the
 * detail page so there is no layout shift when data arrives.
 */

export function ListingDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Image */}
          <div className="w-full aspect-4/3 rounded-xl bg-neutral-100" />
          {/* Thumbnails */}
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-14 h-14 rounded-lg bg-neutral-100" />
            ))}
          </div>
          {/* Action buttons */}
          <div className="flex gap-2">
            <div className="h-9 flex-1 rounded-lg bg-neutral-100" />
            <div className="h-9 flex-1 rounded-lg bg-neutral-100" />
            <div className="h-9 w-9 rounded-lg bg-neutral-100" />
          </div>
          {/* Details block */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-24 rounded bg-neutral-100" />
            <div className="h-6 w-48 rounded bg-neutral-100" />
            <div className="h-3 w-36 rounded bg-neutral-100" />
            <div className="h-3 w-full rounded bg-neutral-100 mt-3" />
            <div className="h-3 w-5/6 rounded bg-neutral-100" />
            <div className="h-3 w-4/6 rounded bg-neutral-100" />
          </div>
        </div>

        {/* Right column */}
        <div className="w-full lg:w-80 shrink-0 space-y-3">
          <div className="h-32 rounded-xl bg-neutral-100" />
          <div className="h-40 rounded-xl bg-neutral-100" />
          <div className="h-24 rounded-xl bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
