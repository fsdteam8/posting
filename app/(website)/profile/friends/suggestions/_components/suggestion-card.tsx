"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Suggestion } from "@/types/features/friends";
import { UserPlus, X } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

type SuggestionCardProps = {
  suggestion: Suggestion;
  onAddFriend: (userId: string) => void;
  onRemove: (userId: string) => void;
  isSending: boolean;
};

export function SuggestionCard({
  suggestion,
  onAddFriend,
  onRemove,
  isSending,
}: SuggestionCardProps) {
  const fullName = `${suggestion.firstName} ${suggestion.lastName}`;
  const initials =
    `${suggestion.firstName[0] ?? ""}${suggestion.lastName[0] ?? ""}`.toUpperCase();
  const hasAvatar = !!suggestion.profileImage?.url;

  const router = useRouter();

  const onProfileGo = () => {
    router.push(`/public/profile/${suggestion.username}`);
  };

  return (
    <div className="flex flex-col items-center rounded-xl border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Cover + Avatar */}
      <div className="relative w-full h-24 bg-linear-to-br from-primary/20 to-primary/5">
        <Avatar className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-16 border-4 border-background ring-2 ring-primary/20">
          {hasAvatar && (
            <AvatarImage
              src={suggestion.profileImage.url}
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
        <p
          className="font-semibold text-sm leading-tight line-clamp-1 cursor-pointer hover:text-primary"
          onClick={onProfileGo}
        >
          {fullName}
        </p>

        {suggestion.username && suggestion.username !== "." && (
          <p className="text-[11px] text-muted-foreground truncate w-full">
            @{suggestion.username}
          </p>
        )}

        {suggestion.bio && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
            {suggestion.bio}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-1.5 w-full mt-3">
          <Button
            size="sm"
            className="w-full text-xs h-8 gap-1"
            onClick={() => onAddFriend(suggestion._id)}
            disabled={isSending}
          >
            {isSending ? (
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <UserPlus className="size-3" />
                Add Friend
              </span>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-8 gap-1"
            onClick={() => onRemove(suggestion._id)}
            disabled={isSending}
          >
            <X className="size-3" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
