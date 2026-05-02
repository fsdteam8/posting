"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NonFriend } from "@/types/features/friends";
import { UserPlus, Users, X } from "lucide-react";

type NonFriendCardProps = {
  user: NonFriend;
  onAddFriend: (userId: string) => void;
  onRemove: (userId: string) => void;
  isPending: boolean;
};

export function NonFriendCard({
  user,
  onAddFriend,
  onRemove,
  isPending,
}: NonFriendCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const hasAvatar = !!user.profileImage?.url;

  return (
    <div className="flex flex-col items-center rounded-lg border bg-card shadow-sm overflow-hidden">
      {/* Profile image area */}
      <div className="relative w-full h-32 bg-muted">
        <Avatar className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-16 border-4 border-background ring-2 ring-primary/20">
          {hasAvatar && (
            <AvatarImage
              src={user.profileImage.url}
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
      <div className="mt-10 px-3 pb-3 flex flex-col items-center w-full gap-1 text-center">
        <p className="font-semibold text-sm leading-tight line-clamp-1">
          {fullName}
        </p>

        {user.mutualFriendsCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3" />
            {user.mutualFriendsCount} mutual
          </span>
        )}

        <div className="flex flex-col gap-1.5 w-full mt-2">
          <Button
            size="sm"
            className="w-full text-xs h-7"
            onClick={() => onAddFriend(user._id)}
            disabled={isPending}
          >
            <UserPlus className="size-3 mr-1" />
            {isPending ? "Sending..." : "Add Friend"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
            onClick={() => onRemove(user._id)}
            disabled={isPending}
          >
            <X className="size-3 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
