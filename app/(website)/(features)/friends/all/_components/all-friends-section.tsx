"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetAllFriends } from "@/hooks/features/friends/use-get-all-friends";
import { useUnfriend } from "@/hooks/features/friends/use-unfriend";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
} from "lucide-react";
import { FriendRequestCardSkeleton } from "../../requests/_components/friend-request-card-skeleton";
import { FriendCard } from "./friend-card";

type AllFriendsSectionProps = {
  accessToken: string;
};

export function AllFriendsSection({ accessToken }: AllFriendsSectionProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError, error } = useGetAllFriends({
    accessToken,
    page,
    limit: 10,
  });

  const { mutate: unfriend } = useUnfriend({ accessToken });

  const handleUnfriend = (friendId: string) => {
    setPendingId(friendId);
    unfriend(
      { friendId },
      {
        onSettled: () => {
          setPendingId(null);
          setRemovedIds((prev) => new Set(prev).add(friendId));
        },
      },
    );
  };

  const allVisible = (data?.data ?? []).filter((f) => !removedIds.has(f._id));

  // Client-side search filter on visible friends
  const visibleFriends = debouncedSearch
    ? allVisible.filter((f) => {
        const fullName = `${f.firstName} ${f.lastName}`.toLowerCase();
        const username = f.username.toLowerCase();
        const q = debouncedSearch.toLowerCase();
        return fullName.includes(q) || username.includes(q);
      })
    : allVisible;

  const totalPages = data?.pagination?.pages ?? 1;
  const totalFriends = data?.meta?.totalFriends ?? 0;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight">All Friends</h2>
          {!isLoading && totalFriends > 0 && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {totalFriends}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error?.message ?? "Failed to load friends."}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <FriendRequestCardSkeleton key={i} />
            ))
          : visibleFriends.map((friend) => (
              <FriendCard
                key={friend._id}
                friend={friend}
                onUnfriend={handleUnfriend}
                isUnfriending={pendingId === friend._id}
              />
            ))}
      </div>

      {/* Empty state */}
      {!isLoading && !isError && visibleFriends.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Users className="size-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            {debouncedSearch
              ? "No friends match your search"
              : "No friends yet"}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            {debouncedSearch
              ? "Try a different name or username."
              : "Start connecting with people you may know."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs gap-1"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-3" />
            Prev
          </Button>

          <span className="text-xs text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs gap-1"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="size-3" />
          </Button>
        </div>
      )}
    </section>
  );
}
