"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetFriendRequests } from "@/hooks/features/friends/use-get-friend-requests";
import { useRespondFriendRequest } from "@/hooks/features/friends/use-respond-friend-request";
import type { FriendRequest } from "@/types/features/friends";
import { formatDistanceToNow } from "date-fns";
import { Check, Loader2, UserCheck, UserX, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  accessToken: string;
  onClose: () => void;
}

type PendingAction = {
  requestId: string;
  action: "accept" | "decline";
};

export function FriendRequestsPanel({ accessToken, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, error } = useGetFriendRequests({
    accessToken,
    mode: "incoming",
  });
  const { mutate: respond } = useRespondFriendRequest({ accessToken });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const requests = useMemo(
    () => data?.data?.filter((request) => !resolvedIds.has(request._id)) ?? [],
    [data?.data, resolvedIds],
  );

  function handleAction(requestId: string, action: "accept" | "decline") {
    setPendingAction({ requestId, action });
    respond(
      { requestId, action },
      {
        onSuccess: (res) => {
          if (res.success) {
            setResolvedIds((prev) => new Set(prev).add(requestId));
          }
        },
        onSettled: () => setPendingAction(null),
      },
    );
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-2 w-90 overflow-hidden rounded-2xl border bg-card shadow-xl ring-1 ring-black/5 animate-in fade-in-0 slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold">Friend Requests</span>
          {requests.length > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              {requests.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="max-h-105 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="px-4 py-10 text-center text-xs text-destructive">
            {error?.message ?? "Failed to load friend requests."}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <UserCheck className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No pending requests</p>
            <p className="text-xs text-muted-foreground">
              Friend requests waiting for your response will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {requests.map((request) => (
              <FriendRequestRow
                key={request._id}
                request={request}
                pendingAction={pendingAction}
                onAccept={() => handleAction(request._id, "accept")}
                onDecline={() => handleAction(request._id, "decline")}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t px-4 py-2.5">
        <Link
          href="/friends/requests"
          onClick={onClose}
          className="block cursor-pointer text-center text-xs text-primary hover:underline"
        >
          See all friend requests
        </Link>
      </div>
    </div>
  );
}

function FriendRequestRow({
  request,
  pendingAction,
  onAccept,
  onDecline,
}: {
  request: FriendRequest;
  pendingAction: PendingAction | null;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { requester } = request;
  const fullName = `${requester.firstName} ${requester.lastName}`;
  const initials =
    `${requester.firstName[0] ?? ""}${requester.lastName[0] ?? ""}`.toUpperCase();
  const pendingForRequest = pendingAction?.requestId === request._id;
  const isAccepting = pendingForRequest && pendingAction.action === "accept";
  const isDeclining = pendingForRequest && pendingAction.action === "decline";

  return (
    <div className="flex gap-3 px-4 py-3">
      <Avatar className="size-11 shrink-0">
        <AvatarImage src={requester.profileImage?.url} alt={fullName} />
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold leading-tight">
              {fullName}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              @{requester.username}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/80">
              {formatDistanceToNow(new Date(request.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            size="sm"
            className="h-7 flex-1 gap-1 text-xs"
            onClick={onAccept}
            disabled={pendingForRequest}
          >
            {isAccepting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3" />
            )}
            Confirm
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 flex-1 gap-1 text-xs"
            onClick={onDecline}
            disabled={pendingForRequest}
          >
            {isDeclining ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <UserX className="size-3" />
            )}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
