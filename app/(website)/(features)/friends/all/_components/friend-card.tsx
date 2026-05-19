"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStartDirectChat } from "@/hooks/features/messenger/use-start-direct-chat";
import { Loader2, MessageCircle, MoreHorizontal, UserMinus, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Friend } from "@/types/features/friends";
import { formatDistanceToNow } from "date-fns";

type FriendCardProps = {
  friend: Friend;
  accessToken: string;
  onUnfriend: (friendId: string) => void;
  isUnfriending: boolean;
};

export function FriendCard({
  friend,
  accessToken,
  onUnfriend,
  isUnfriending,
}: FriendCardProps) {
  const { startChat, isStarting } = useStartDirectChat({ accessToken });
  const fullName = `${friend.firstName} ${friend.lastName}`;
  const initials =
    `${friend.firstName[0] ?? ""}${friend.lastName[0] ?? ""}`.toUpperCase();
  const hasAvatar = !!friend.profileImage?.url;

  const lastSeen = friend.isOnline
    ? null
    : friend.lastActiveAt
      ? formatDistanceToNow(new Date(friend.lastActiveAt), { addSuffix: true })
      : null;

  return (
    <div className="flex flex-col items-center rounded-xl border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md group">
      {/* Cover + Avatar */}
      <div className="relative w-full h-24 bg-linear-to-br from-muted to-muted/40">
        {/* Dropdown menu — top right */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="size-6 rounded-full shadow-sm"
              >
                <MoreHorizontal className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive gap-2 text-xs"
                disabled={isUnfriending}
                onClick={() => onUnfriend(friend._id)}
              >
                <UserMinus className="size-3" />
                Unfriend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Online indicator dot on avatar */}
        <div className=" mx-auto w-fit absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <Avatar className="size-16 border-4 border-background ring-2 ring-border">
            {hasAvatar && (
              <AvatarImage
                src={friend.profileImage.url}
                alt={fullName}
                className="object-cover"
              />
            )}
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Online dot */}
          <span
            className={cn(
              "absolute bottom-1 right-1 size-3 rounded-full border-2 border-background",
              friend.isOnline ? "bg-emerald-500" : "bg-muted-foreground/40",
            )}
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-10 px-3 pb-4 flex flex-col items-center w-full gap-1 text-center">
        <p className="font-semibold text-sm leading-tight line-clamp-1">
          {fullName}
        </p>

        {friend.isOnline ? (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            Online
          </Badge>
        ) : lastSeen ? (
          <p className="text-[11px] text-muted-foreground">{lastSeen}</p>
        ) : null}

        {friend.mutualFriendsCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="size-3" />
            {friend.mutualFriendsCount} mutual
          </span>
        )}

        {/* Actions */}
        <div className="flex gap-1.5 w-full mt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8 gap-1 cursor-pointer"
            onClick={() => startChat(friend._id)}
            disabled={isStarting}
          >
            {isStarting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <MessageCircle className="size-3" />
            )}
            Message
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
            onClick={() => onUnfriend(friend._id)}
            disabled={isUnfriending}
          >
            {isUnfriending ? (
              <span className="size-3 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin" />
            ) : (
              <UserMinus className="size-3" />
            )}
            {isUnfriending ? "..." : "Unfriend"}
          </Button>
        </div>
      </div>
    </div>
  );
}
