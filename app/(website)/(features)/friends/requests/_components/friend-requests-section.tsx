"use client";

import { Button } from "@/components/ui/button";
import { useGetFriendRequests } from "@/hooks/features/friends/use-get-friend-requests";
import { useRespondFriendRequest } from "@/hooks/features/friends/use-respond-friend-request";
import { AlertCircle, Send, UserCheck } from "lucide-react";
import { useState } from "react";
import { FriendRequestCard } from "./friend-request-card";
import { FriendRequestCardSkeleton } from "./friend-request-card-skeleton";
import { SentRequestsModal } from "./sent-requests-modal";

type FriendRequestsSectionProps = {
  accessToken: string;
};

export function FriendRequestsSection({
  accessToken,
}: FriendRequestsSectionProps) {
  const [pendingState, setPendingState] = useState<{
    requestId: string;
    action: "accept" | "decline";
  } | null>(null);

  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [sentModalOpen, setSentModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useGetFriendRequests({
    accessToken,
    mode: "incoming",
  });

  const { mutate: respond } = useRespondFriendRequest({ accessToken });

  const handleAction = (requestId: string, action: "accept" | "decline") => {
    setPendingState({ requestId, action });
    respond(
      { requestId, action },
      {
        onSettled: () => {
          setPendingState(null);
          setResolvedIds((prev) => new Set(prev).add(requestId));
        },
      },
    );
  };

  const visibleRequests =
    data?.data?.filter((r) => !resolvedIds.has(r._id)) ?? [];

  return (
    <section className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight">Friend Requests</h2>
          {!isLoading && visibleRequests.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {visibleRequests.length}
            </span>
          )}
        </div>

        {/* View sent requests — link-style button on the right */}
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5 font-medium"
          onClick={() => setSentModalOpen(true)}
        >
          <Send className="size-3" />
          View sent requests
        </Button>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error?.message ?? "Failed to load friend requests."}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <FriendRequestCardSkeleton key={i} />
            ))
          : visibleRequests.map((request) => (
              <FriendRequestCard
                key={request._id}
                request={request}
                onAccept={(id) => handleAction(id, "accept")}
                onDecline={(id) => handleAction(id, "decline")}
                isPendingAccept={
                  pendingState?.requestId === request._id &&
                  pendingState.action === "accept"
                }
                isPendingDecline={
                  pendingState?.requestId === request._id &&
                  pendingState.action === "decline"
                }
              />
            ))}
      </div>

      {/* Empty state */}
      {!isLoading && !isError && visibleRequests.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <UserCheck className="size-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No pending friend requests</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            When someone sends you a friend request, it will appear here.
          </p>
        </div>
      )}

      {/* Sent requests modal */}
      <SentRequestsModal
        open={sentModalOpen}
        onOpenChange={setSentModalOpen}
        accessToken={accessToken}
      />
    </section>
  );
}
