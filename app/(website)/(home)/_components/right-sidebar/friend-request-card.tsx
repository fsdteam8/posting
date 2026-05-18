"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetFriendRequests } from "@/hooks/features/friends/use-get-friend-requests";
import { useRespondFriendRequest } from "@/hooks/features/friends/use-respond-friend-request";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";

type Props = {
  accessToken: string;
};

export function FriendRequestCard({ accessToken }: Props) {
  const router = useRouter();

  const { data, isLoading } = useGetFriendRequests({
    accessToken,
    mode: "incoming",
  });

  const { mutate: respond } = useRespondFriendRequest({ accessToken });

  // Track which requestId is pending + which action
  const [pendingState, setPendingState] = useState<{
    requestId: string;
    action: "accept" | "decline";
  } | null>(null);

  // Optimistically hide resolved cards
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

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

  // Show only the first request in the sidebar widget
  const previewRequest = visibleRequests[0];
  const remainingCount = Math.max(0, visibleRequests.length - 1);

  if (isLoading) {
    return <FriendRequestCardSkeleton />;
  }

  if (!previewRequest) return null;

  const { requester } = previewRequest;
  const fullName = `${requester.firstName} ${requester.lastName}`;
  const hasAvatar = !!requester.profileImage?.url;
  const initials =
    `${requester.firstName[0] ?? ""}${requester.lastName[0] ?? ""}`.toUpperCase();

  const isAccepting =
    pendingState?.requestId === previewRequest._id &&
    pendingState.action === "accept";

  const isDeclining =
    pendingState?.requestId === previewRequest._id &&
    pendingState.action === "decline";

  const onProfileGo = () => {
    router.push(`/public/profile/${requester.username}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold text-foreground">
          Friend Requests
        </h3>
        <button
          className="text-[14px] font-medium text-primary hover:underline cursor-pointer"
          onClick={() => router.push("/friends/requests")}
        >
          See all
        </button>
      </div>

      {/* Single preview request */}
      <div className="flex items-start gap-3">
        <Avatar className="size-12 shrink-0">
          {hasAvatar && (
            <AvatarImage
              src={requester.profileImage.url}
              alt={fullName}
              className="object-cover"
            />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-col">
            <span
              className="text-[14px] font-semibold text-foreground cursor-pointer hover:text-primary"
              onClick={onProfileGo}
            >
              {fullName}
            </span>
            <span className="text-[12px] text-muted-foreground">
              @{requester.username}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 flex-1 rounded-md text-[13px] font-semibold"
              disabled={isAccepting || isDeclining}
              onClick={() => handleAction(previewRequest._id, "accept")}
            >
              {isAccepting ? "Accepting..." : "Confirm"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="h-8 flex-1 rounded-md text-[13px] font-semibold"
              disabled={isAccepting || isDeclining}
              onClick={() => handleAction(previewRequest._id, "decline")}
            >
              {isDeclining ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      {/* Show count of remaining requests */}
      {remainingCount > 0 && (
        <button
          className="text-[13px] font-medium text-primary hover:underline text-left"
          onClick={() => router.push("/friends/requests")}
        >
          +{remainingCount} more {remainingCount === 1 ? "request" : "requests"}
        </button>
      )}
    </div>
  );
}

function FriendRequestCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex items-start gap-3">
        <Skeleton className="size-12 rounded-full shrink-0" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
