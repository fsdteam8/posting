"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useStartDirectChat } from "@/hooks/features/messenger/use-start-direct-chat";
import { cn } from "@/lib/utils";
import type { BirthdayFriend } from "@/types/features/birthdays";
import { Loader2, MessageCircle } from "lucide-react";

interface Props {
  user: BirthdayFriend;
  accessToken: string;
  ageLabel?: string | null;
  dateLabel?: string | null;
  className?: string;
}

export function BirthdayMessageRow({
  user,
  accessToken,
  ageLabel,
  dateLabel,
  className,
}: Props) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const hasAvatar = !!user.profileImage?.url;

  const { startChat, isStarting } = useStartDirectChat({ accessToken });

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar className="size-12 shrink-0">
        {hasAvatar && (
          <AvatarImage
            src={user.profileImage.url}
            alt={fullName}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">
          {fullName}
        </p>
        {dateLabel && (
          <p className="text-xs text-muted-foreground mt-0.5">{dateLabel}</p>
        )}
      </div>

      {ageLabel && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {ageLabel}
        </span>
      )}

      <Button
        variant="secondary"
        size="sm"
        className="rounded-full gap-1.5"
        onClick={() => startChat(user._id)}
        disabled={isStarting}
      >
        {isStarting ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <MessageCircle className="size-3.5 text-primary" />
        )}
        Message
      </Button>
    </div>
  );
}
