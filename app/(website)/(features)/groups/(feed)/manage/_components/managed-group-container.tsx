"use client";

import ErrorScreen from "@/components/shared/screens/error-screen";
import { useGetMyGroup } from "@/hooks/features/groups/api/use-get-my-group";
import dynamic from "next/dynamic";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef } from "react";
const JoinedGroupCard = dynamic(
  () => import("../../joined/_components/joined-group-card"),
  {
    ssr: false,
  },
);

interface Props {
  accessToken: string;
  limit?: number;
}

const ManagedGroupContainer = ({ accessToken, limit = 12 }: Props) => {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMyGroup({
    accessToken,
    limit,
  });

  const groups = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages?.[0]?.pagination?.total ?? 0;

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "300px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ---------- Initial Loading ----------
  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <JoinedGroupCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ---------- Error ----------
  if (isError) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    return (
      <ErrorScreen
        message={message}
        onRetry={refetch}
        isRefetching={isFetching}
      />
    );
  }

  // ---------- Empty ----------
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-base font-semibold text-foreground">
          You haven&apos;t created any groups yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create groups to see updates and discussions here.
        </p>

        <div className="mt-4 flex justify-center gap-2">
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 cursor-pointer"
            onClick={() => router.push("/groups/discover")}
          >
            Discover groups
          </button>
          <button
            className="rounded-lg border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
            onClick={() => router.push("/groups/create")}
          >
            Create group
          </button>
        </div>
      </div>
    );
  }

  // ---------- Success ----------
  return (
    <div className="space-y-3">
      {isFetching && !isFetchingNextPage && (
        <div className="rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
          Updating…
        </div>
      )}

      <div>
        <h1 className="font-medium text-sm text-foreground">
          All groups you&apos;ve manage ({groups.length}
          {total ? ` / ${total}` : ""})
        </h1>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {groups.map((item) => (
          <JoinedGroupCard
            key={item._id}
            data={item}
            accessToken={accessToken}
            isAdmin
            onViewClick={() => router.push(`/groups/${item.groupUserName}`)}
          />
        ))}
      </div>

      <div ref={loadMoreRef} />

      {isFetchingNextPage && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading more groups...
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagedGroupContainer;

export function JoinedGroupCardSkeleton() {
  return (
    <div className="w-full max-w-101 rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
      {/* Top section */}
      <div className="flex items-center gap-3 p-3 pb-2.5">
        <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-lg bg-muted animate-pulse" />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
          <div className="mt-2 h-3 w-1/3 rounded bg-muted animate-pulse" />
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        <div className="h-9 flex-1 rounded-md bg-muted animate-pulse" />
        <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}
