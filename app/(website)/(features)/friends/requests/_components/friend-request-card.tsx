"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FriendRequest } from "@/types/features/friends";
import { formatDistanceToNow } from "date-fns";
import { UserCheck, UserX, Users } from "lucide-react";

type FriendRequestCardProps = {
  request: FriendRequest;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  isPendingAccept: boolean;
  isPendingDecline: boolean;
};

export function FriendRequestCard({
  request,
  onAccept,
  onDecline,
  isPendingAccept,
  isPendingDecline,
}: FriendRequestCardProps) {
  const { requester, createdAt } = request;
  const fullName = `${requester.firstName} ${requester.lastName}`;
  const initials =
    `${requester.firstName[0] ?? ""}${requester.lastName[0] ?? ""}`.toUpperCase();
  const hasAvatar = !!requester.profileImage?.url;
  const isAnyPending = isPendingAccept || isPendingDecline;

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className="flex flex-col items-center rounded-xl border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Cover + Avatar */}
      <div className="relative w-full h-24 bg-linear-to-br from-primary/20 to-primary/5">
        <Avatar className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-16 border-4 border-background ring-2 ring-primary/20">
          {hasAvatar && (
            <AvatarImage
              src={requester.profileImage.url}
              alt={fullName}
              className="object-cover"
            />
          )}
          <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Info */}
      <div className="mt-10 px-3 pb-4 flex flex-col items-center w-full gap-1 text-center">
        <p className="font-semibold text-sm leading-tight line-clamp-1">
          {fullName}
        </p>

        <p className="text-xs text-muted-foreground line-clamp-1">
          @{requester.username}
        </p>

        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <Users className="size-3" />
          {timeAgo}
        </span>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 w-full mt-3">
          <Button
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => onAccept(request._id)}
            disabled={isAnyPending}
          >
            {isPendingAccept ? (
              <span className="flex items-center gap-1">
                <span className="size-3 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                Accepting...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <UserCheck className="size-3" />
                Confirm
              </span>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-8"
            onClick={() => onDecline(request._id)}
            disabled={isAnyPending}
          >
            {isPendingDecline ? (
              <span className="flex items-center gap-1">
                <span className="size-3 rounded-full border-2 border-foreground/20 border-t-foreground/60 animate-spin" />
                Declining...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <UserX className="size-3" />
                Delete
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
