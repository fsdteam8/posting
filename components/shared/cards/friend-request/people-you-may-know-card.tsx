"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PeopleYouMayKnowCardProps {
  id: string;
  name: string;
  avatar: string;
  mutualFriendsCount: number;
  onAddFriend?: (id: string) => void;
  isLoading?: boolean;
}

export function PeopleYouMayKnowCard({
  id,
  name,
  avatar,
  mutualFriendsCount,
  onAddFriend,
  isLoading = false,
}: PeopleYouMayKnowCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddFriend = () => {
    setIsAdded(true);
    onAddFriend?.(id);
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 transition-all hover:shadow-sm">
      {/* Avatar */}
      <Avatar className="size-20">
        <AvatarImage src={avatar} alt={name} className="object-cover" />
        <AvatarFallback className="text-lg font-semibold">
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <div className="text-center">
        <h3 className="font-semibold text-foreground text-balance">{name}</h3>
      </div>

      {/* Mutual friends */}
      <p className="text-xs text-muted-foreground">
        {mutualFriendsCount} mutual{" "}
        {mutualFriendsCount === 1 ? "friend" : "friends"}
      </p>

      {/* Add Friend Button */}
      <Button
        onClick={handleAddFriend}
        disabled={isAdded || isLoading}
        className="w-full rounded-full font-medium"
        size="sm"
      >
        {isAdded ? "✓ Added" : "+ Add Friend"}
      </Button>
    </div>
  );
}
