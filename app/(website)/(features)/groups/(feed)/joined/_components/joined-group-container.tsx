"use client";

import ErrorScreen from "@/components/shared/screens/error-screen";
import { baseURL } from "@/constants";
import { useInfiniteQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef } from "react";

const JoinedGroupCard = dynamic(() => import("./joined-group-card"), {
  ssr: false,
});

interface Props {
  accessToken: string;
  limit?: number;
}

const JoinedGroupContainer = ({ accessToken, limit = 12 }: Props) => {
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
    queryKey: ["joined-group", accessToken, limit],
    enabled: !!accessToken,
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as number) ?? 1;

      const res = await fetch(
        `${baseURL}/groups?mode=joined&page=${page}&limit=${limit}`,
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

  // Total from API (optional display)
  const total = data?.pages?.[0]?.pagination?.total ?? 0;

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
            onClick={() => router.push("/groups/discover")}
          >
            Discover groups
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
        <h1 className="font-medium text-sm">
          All groups you&apos;ve joined ({groups.length}
          {total ? ` / ${total}` : ""})
        </h1>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {groups.map((item) => (
          <JoinedGroupCard
            key={item._id}
            data={item}
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

export default JoinedGroupContainer;

/** Simple skeleton that visually matches a card list */
export function JoinedGroupCardSkeleton() {
  return (
    <div className="w-full max-w-101 rounded-lg border border-[#dadde1] bg-[#ffffff] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
      {/* Top section: Avatar + Info */}
      <div className="flex items-center gap-3 p-3 pb-2.5">
        {/* Image skeleton */}
        <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-lg bg-gray-200 animate-pulse" />

        {/* Text skeleton */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-3 w-1/3 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* Bottom section: Actions */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        {/* View group button skeleton */}
        <div className="h-9 flex-1 rounded-md bg-gray-200 animate-pulse" />
        {/* Action button skeleton */}
        <div className="h-9 w-9 rounded-md bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

// ---------------- Types ----------------

export interface GroupsResponse {
  success: boolean;
  message: string;
  data: Group[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Group {
  _id: string;
  name: string;
  category: string;
  privacy: "public" | "private";

  // These are not present in your sample response, so optional:
  description?: string;
  coverImage?: ImageAsset;

  rules: string[];
  pendingMembers: Member[];
  members: Member[];
  admins: Member[];

  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  __v: number;

  // Present in sample response:
  memberMeta: unknown[]; // replace with a real type when you know the schema
  currentUserMeta: CurrentUserMeta;
}

export interface CurrentUserMeta {
  isPinned: boolean;
  pinnedAt: string | null;
  lastVisitedAt: string | null;
}

export interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: ProfileImage;
}

export interface ProfileImage {
  public_id: string;
  url: string;
}

export interface ImageAsset {
  public_id: string;
  url: string;
}
