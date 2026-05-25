"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, Loader2, UserPlus } from "lucide-react";

interface PeopleYouMayKnowCardProps {
  id: string;
  name: string;
  avatar: string;
  mutualFriendsCount: number;
  onAddFriend?: (id: string) => void;
  isLoading?: boolean;
  isAdded?: boolean;
}

export function PeopleYouMayKnowCard({
  id,
  name,
  avatar,
  onAddFriend,
  isLoading = false,
  isAdded = false,
}: PeopleYouMayKnowCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 transition-all hover:shadow-sm">
      {/* Avatar */}
      <Avatar className="size-20">
        <AvatarImage src={avatar} alt={name} className="object-cover" />
        <AvatarFallback className="text-lg font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <div className="text-center">
        <h3 className="font-semibold text-foreground text-balance text-[14px]">
          {name}
        </h3>
      </div>

      {/* Add Friend Button */}
      <Button
        onClick={() => onAddFriend?.(id)}
        disabled={isAdded || isLoading}
        variant={isAdded ? "secondary" : "default"}
        className="w-full rounded-full font-medium"
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Sending...
          </>
        ) : isAdded ? (
          <>
            <Check className="size-3.5" />
            Request Sent
          </>
        ) : (
          <>
            <UserPlus className="size-3.5" />
            Add Friend
          </>
        )}
      </Button>
    </div>
  );
}
