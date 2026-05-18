"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCancelFriendRequest } from "@/hooks/features/friends/use-cancel-friend-request";
import { useGetSentRequests } from "@/hooks/features/friends/use-get-sent-requests";
import { FriendRequest } from "@/types/features/friends";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, Loader2, UserX } from "lucide-react";
import { useState } from "react";

type SentRequestsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessToken: string;
};

export function SentRequestsModal({
  open,
  onOpenChange,
  accessToken,
}: SentRequestsModalProps) {
  // Only fetch when modal is open
  const { data, isLoading, isError, error } = useGetSentRequests({
    accessToken,
    enabled: open,
  });

  const { mutate: cancelRequest } = useCancelFriendRequest({ accessToken });

  // Optimistically hide cancelled cards
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleCancel = (requestId: string) => {
    setPendingId(requestId);
    cancelRequest(
      { requestId },
      {
        onSettled: () => {
          setPendingId(null);
          setCancelledIds((prev) => new Set(prev).add(requestId));
        },
      },
    );
  };

  const visibleRequests =
    data?.data?.filter((r) => !cancelledIds.has(r._id)) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-base font-semibold">
            Sent Friend Requests
          </DialogTitle>
          {!isLoading && visibleRequests.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {visibleRequests.length} pending{" "}
              {visibleRequests.length === 1 ? "request" : "requests"}
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-105">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SentRequestRowSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex items-center gap-2 m-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error?.message ?? "Failed to load sent requests."}</span>
            </div>
          )}

          {/* List */}
          {!isLoading && !isError && visibleRequests.length > 0 && (
            <div className="flex flex-col divide-y">
              {visibleRequests.map((request) => (
                <SentRequestRow
                  key={request._id}
                  request={request}
                  onCancel={handleCancel}
                  isCancelling={pendingId === request._id}
                />
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && visibleRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <UserX className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No sent requests</p>
              <p className="text-xs text-muted-foreground max-w-55">
                Friend requests you send will appear here until accepted or
                cancelled.
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ── Row ──────────────────────────────────────────────────────

type SentRequestRowProps = {
  request: FriendRequest;
  onCancel: (requestId: string) => void;
  isCancelling: boolean;
};

function SentRequestRow({
  request,
  onCancel,
  isCancelling,
}: SentRequestRowProps) {
  const { recipient, createdAt } = request;
  const fullName = `${recipient.firstName} ${recipient.lastName}`;
  const initials =
    `${recipient.firstName[0] ?? ""}${recipient.lastName[0] ?? ""}`.toUpperCase();
  const hasAvatar = !!recipient.profileImage?.url;
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
      {/* Avatar */}
      <Avatar className="size-10 shrink-0">
        {hasAvatar && (
          <AvatarImage
            src={recipient.profileImage.url}
            alt={fullName}
            className="object-cover"
          />
        )}
        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">{fullName}</p>
        <p className="text-xs text-muted-foreground truncate">
          @{recipient.username}
        </p>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
          <Clock className="size-3" />
          {timeAgo}
        </span>
      </div>

      {/* Cancel button */}
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
        onClick={() => onCancel(request._id)}
        disabled={isCancelling}
      >
        {isCancelling ? <Loader2 className="size-3 animate-spin" /> : "Cancel"}
      </Button>
    </div>
  );
}

// ── Skeleton row ─────────────────────────────────────────────

function SentRequestRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-5 py-3 animate-pulse">
      <div className="size-10 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-32 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
      <div className="h-8 w-16 bg-muted rounded shrink-0" />
    </div>
  );
}
