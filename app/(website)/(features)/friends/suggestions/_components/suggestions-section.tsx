"use client";

import { useGetSuggestions } from "@/hooks/features/friends/use-get-suggestions";
import { useSendFriendRequest } from "@/hooks/features/friends/use-send-friend-request";
import { AlertCircle, Lightbulb } from "lucide-react";
import { useState } from "react";
import { SuggestionCard } from "./suggestion-card";
import { SuggestionCardSkeleton } from "./suggestion-card-skeleton";

type SuggestionsSectionProps = {
  accessToken: string;
};

export function SuggestionsSection({ accessToken }: SuggestionsSectionProps) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useGetSuggestions({
    accessToken,
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
          // Optimistically hide after request sent
          setRemovedIds((prev) => new Set(prev).add(userId));
        },
      },
    );
  };

  const handleRemove = (userId: string) => {
    setRemovedIds((prev) => new Set(prev).add(userId));
  };

  const visibleSuggestions =
    data?.data?.filter((s) => !removedIds.has(s._id)) ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold tracking-tight">Suggestions</h2>
        {!isLoading && visibleSuggestions.length > 0 && (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {visibleSuggestions.length}
          </span>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <SuggestionCardSkeleton key={i} />
            ))
          : visibleSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion._id}
                suggestion={suggestion}
                onAddFriend={handleAddFriend}
                onRemove={handleRemove}
                isSending={pendingId === suggestion._id}
              />
            ))}
      </div>

      {/* Empty state */}
      {!isLoading && !isError && visibleSuggestions.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Lightbulb className="size-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No suggestions right now</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Check back later — we will suggest people based on your network.
          </p>
        </div>
      )}
    </section>
  );
}
