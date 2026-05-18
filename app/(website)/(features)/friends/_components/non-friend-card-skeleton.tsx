import { Skeleton } from "@/components/ui/skeleton";

export function NonFriendCardSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="relative w-full h-32 bg-muted">
        <Skeleton className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-16 rounded-full border-4 border-background" />
      </div>

      <div className="mt-10 px-3 pb-3 flex flex-col items-center w-full gap-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-7 w-full rounded mt-1" />
        <Skeleton className="h-7 w-full rounded" />
      </div>
    </div>
  );
}
