"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useGetNonFriends } from "@/hooks/features/friends/use-get-non-friends";
import { useSendFriendRequest } from "@/hooks/features/friends/use-send-friend-request";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { NonFriendCard } from "./non-friend-card";
import { NonFriendCardSkeleton } from "./non-friend-card-skeleton";

type PeopleYouMayKnowProps = {
  accessToken: string;
};

export function PeopleYouMayKnow({ accessToken }: PeopleYouMayKnowProps) {
  const [page, setPage] = useState(1);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useGetNonFriends({
    accessToken,
    page,
    limit: 10,
  });

  const { mutate: sendRequest } = useSendFriendRequest({ accessToken });

  const handleAddFriend = (userId: string) => {
    setPendingId(userId);
    sendRequest(
      { receiverId: userId },
      {
        onSettled: () => {
          setPendingId(null);
          // Optimistically hide the card after request is sent
          setRemovedIds((prev) => new Set(prev).add(userId));
        },
      },
    );
  };

  const handleRemove = (userId: string) => {
    setRemovedIds((prev) => new Set(prev).add(userId));
  };

  const visibleUsers = data?.data?.filter((u) => !removedIds.has(u._id)) ?? [];

  const totalPages = data?.pagination?.pages ?? 1;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">
          People You May Know
        </h2>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="outline"
              className="size-7"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-1">
              {page} / {totalPages}
            </span>
            <Button
              size="icon"
              variant="outline"
              className="size-7"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error?.message ?? "Failed to load suggestions."}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-3">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <NonFriendCardSkeleton key={i} />
            ))
          : visibleUsers.map((user) => (
              <NonFriendCard
                key={user._id}
                user={user}
                onAddFriend={handleAddFriend}
                onRemove={handleRemove}
                isPending={pendingId === user._id}
              />
            ))}

        {/* Empty state after removals */}
        {!isLoading && !isError && visibleUsers.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No more suggestions right now. Check back later!
          </div>
        )}
      </div>
    </section>
  );
}
