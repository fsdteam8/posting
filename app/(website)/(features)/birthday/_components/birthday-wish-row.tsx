"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendBirthdayWish } from "@/hooks/features/birthdays/use-send-birthday-wish";
import { cn } from "@/lib/utils";
import type { BirthdayFriend } from "@/types/features/birthdays";
import { Loader2, Send, Smile } from "lucide-react";
import { useState } from "react";
import { buildDefaultWish, QUICK_WISHES } from "./quick-wishes";

interface Props {
  user: BirthdayFriend;
  accessToken: string;
  /** Age (years) to render on the right. Omit to hide. */
  ageLabel?: string | null;
  /** Optional date string to render under the name. */
  dateLabel?: string | null;
  className?: string;
}

export function BirthdayWishRow({
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

  const [text, setText] = useState(buildDefaultWish(user.firstName));
  const { sendWish, isSending } = useSendBirthdayWish({ accessToken });

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const ok = await sendWish({ userId: user._id, text: trimmed });
    if (ok) setText(buildDefaultWish(user.firstName));
  };

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Avatar className="size-14 shrink-0">
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

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">
              {fullName}
            </p>
            {dateLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {dateLabel}
              </p>
            )}
          </div>
          {ageLabel && (
            <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
              {ageLabel}
            </span>
          )}
        </div>

        <div className="relative">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={`Happy Birthday, ${user.firstName}!`}
            className="pr-20 rounded-full bg-muted/60 border-transparent focus-visible:bg-background"
            disabled={isSending}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Emoji"
              tabIndex={-1}
            >
              <Smile className="size-4" />
            </button>
            <Button
              type="button"
              size="icon"
              className="size-8 rounded-full"
              onClick={submit}
              disabled={isSending || !text.trim()}
              aria-label="Send birthday wish"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_WISHES.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setText(w)}
              disabled={isSending}
              className="px-3 py-1 text-xs rounded-full border border-border bg-background hover:bg-muted transition-colors text-foreground disabled:opacity-50"
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
