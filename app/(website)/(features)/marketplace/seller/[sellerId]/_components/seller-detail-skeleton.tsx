/**
 * SellerDetailSkeleton
 *
 * Shown while useGetSellerProfile is loading. Mirrors the seller page
 * layout (cover, avatar, meta, listing grid) so there is no layout shift
 * when data arrives.
 */

export function SellerDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 animate-pulse">
      <div className="h-4 w-20 rounded bg-neutral-100 mb-4" />

      {/* Header card */}
      <div className="rounded-2xl bg-white border border-neutral-100 overflow-hidden mb-6">
        <div className="w-full h-44 sm:h-56 lg:h-64 bg-neutral-100" />
        <div className="relative px-4 sm:px-6 pb-5">
          <div className="absolute -top-12 sm:-top-14 left-4 sm:left-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-neutral-100 ring-4 ring-white" />
          <div className="pt-14 sm:pt-16 lg:pl-32 space-y-2">
            <div className="h-6 w-56 rounded bg-neutral-100" />
            <div className="h-3.5 w-32 rounded bg-neutral-100" />
            <div className="flex gap-3 mt-3">
              <div className="h-3 w-36 rounded bg-neutral-100" />
              <div className="h-3 w-36 rounded bg-neutral-100" />
              <div className="h-3 w-40 rounded bg-neutral-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Section title */}
      <div className="h-4 w-32 rounded bg-neutral-100 mb-3" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-100 overflow-hidden"
          >
            <div className="aspect-square bg-neutral-100" />
            <div className="p-2.5 space-y-1.5">
              <div className="h-3.5 w-16 bg-neutral-100 rounded" />
              <div className="h-3 w-28 bg-neutral-100 rounded" />
              <div className="h-2.5 w-20 bg-neutral-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
