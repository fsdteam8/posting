"use client";

import ErrorScreen from "@/components/shared/screens/error-screen";
import { baseURL } from "@/constants";
import { GroupsResponse } from "@/types/features/groups";
import { useInfiniteQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef } from "react";

const DiscoverGroupCard = dynamic(() => import("./discover-group-card"), {
  ssr: false,
});

interface Props {
  accessToken: string;
  limit?: number;
}

const DiscoverGroupContainer = ({ accessToken, limit = 12 }: Props) => {
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
  } = useInfiniteQuery<GroupsResponse>({
    queryKey: ["discover-group", accessToken, limit],
    enabled: !!accessToken,
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as number) ?? 1;

      const res = await fetch(
        `${baseURL}/groups?mode=discover&page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          message = body?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    staleTime: 30_000,
    retry: 1,
  });

  // Flatten all pages into one list
  const groups = data?.pages.flatMap((p) => p.data) ?? [];

  // IntersectionObserver: when sentinel visible -> load next page
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <GroupCardSkeleton key={i} />
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
      <div className="rounded-xl border bg-white p-6 text-center">
        <p className="text-base font-semibold text-gray-900">
          You haven’t joined any groups yet
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Join groups to see updates and discussions here.
        </p>

        <div className="mt-4 flex justify-center gap-2">
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
            onClick={() => router.push("/groups/joined")}
          >
            Your groups
          </button>
          <button
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer"
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
      {/* subtle top bar like FB when background refetch happens */}
      {isFetching && !isFetchingNextPage && (
        <div className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-600">
          Updating…
        </div>
      )}

      <div>
        <h1 className="font-medium text-xl">More suggestions</h1>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {groups.map((item) => (
          <DiscoverGroupCard
            key={item._id}
            group={item}
            accessToken={accessToken}
          />
        ))}
      </div>

      {/* Sentinel (observer watches this) */}
      <div ref={loadMoreRef} />

      {/* Bottom loader */}
      {isFetchingNextPage && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          <p className="mt-3 text-sm text-gray-500">Loading more groups...</p>
        </div>
      )}

      {/* End message */}
    </div>
  );
};

export default DiscoverGroupContainer;

/** Simple skeleton that visually matches a card list */
export function GroupCardSkeleton({
  showClose = false,
}: {
  showClose?: boolean;
}) {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-lg">
      {/* Cover */}
      <div className="relative h-40 w-full bg-slate-200">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-pulse bg-linear-to-r from-slate-200 via-slate-100 to-slate-200" />

        {/* Close button placeholder (optional) */}
        {showClose && (
          <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/70" />
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Title + stats */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-slate-200 animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-slate-200 animate-pulse" />
        </div>

        {/* Members preview */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 animate-pulse" />
            <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 animate-pulse" />
            <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 animate-pulse" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="h-4 w-full max-w-55 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-2/3 max-w-45 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>

        {/* Button */}
        <div className="h-10 w-full rounded-md bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}
