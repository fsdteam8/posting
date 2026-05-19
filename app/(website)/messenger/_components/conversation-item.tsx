"use client";

import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/messenger";
import { format, isToday, isYesterday } from "date-fns";
import { BellOff, CheckCheck, PhoneMissed } from "lucide-react";
import Link from "next/link";
import { Avatar } from "./avatar";
import {
  displayNameInConversation,
  getConversationAvatar,
  getConversationTitle,
} from "./helpers";
import { useMessenger } from "./messenger-context";

interface Props {
  conversation: Conversation;
  meId: string;
  active: boolean;
}

function formatTime(at?: string | null) {
  if (!at) return "";
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return "";
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 7) return format(d, "EEE");
  if (diffDays < 365) return format(d, "d MMM");
  return format(d, "MMM yyyy");
}

export function ConversationItem({ conversation, meId, active }: Props) {
  const { presence } = useMessenger();
  // Use nickname for direct chats when present
  const other = conversation.participants.find((p) => p._id !== meId);
  const baseTitle = getConversationTitle(conversation, meId);
  const title =
    !conversation.isGroup && other
      ? displayNameInConversation(other, conversation._id)
      : baseTitle;
  const avatar = getConversationAvatar(conversation, meId);
  const last = conversation.lastMessage;
  const lastSenderId =
    typeof last?.sender === "string"
      ? last?.sender
      : (last?.sender as { _id?: string } | undefined)?._id;
  const isMine = lastSenderId === meId;
  const time = formatTime(last?.at);
  const isMuted = !!(conversation.mutedBy || []).find((id) => id === meId);
  const isMissed = last?.type === "missed-call";
  const unread = conversation.unreadCount || 0;
  // Live presence wins over the stored value when available
  const livePresence = other ? presence[other._id] : undefined;
  const isOnline =
    !conversation.isGroup &&
    (livePresence ? livePresence.isOnline : !!other?.isOnline);

  let preview = last?.text || "";
  if (!preview && last?.type) {
    if (last.type === "image") preview = "Sent a photo";
    else if (last.type === "video") preview = "Sent a video";
    else if (last.type === "audio") preview = "Voice message";
    else if (last.type === "file") preview = "Sent a file";
  }
  if (isMine && preview && !preview.startsWith("You: "))
    preview = `You: ${preview}`;
  if (isMissed) preview = "Missed call";

  return (
    <Link
      href={`/messenger/${conversation._id}`}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        active ? "bg-primary/8" : "hover:bg-muted/60",
      )}
    >
      <div className="relative shrink-0">
        <div className="relative size-12 overflow-hidden rounded-full bg-muted">
          <Avatar
            src={avatar}
            alt={title}
            sizes="48px"
            isGroup={conversation.isGroup}
          />
        </div>
        {isOnline && (
          <span className="absolute -bottom-0.5 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-[14.5px] leading-tight",
              unread > 0 ? "font-bold text-foreground" : "font-semibold",
            )}
          >
            {title}
          </span>
          {time && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {time}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {isMissed && (
            <PhoneMissed className="size-3.5 shrink-0 text-destructive" />
          )}
          <p
            className={cn(
              "truncate text-[12.5px] leading-snug",
              isMissed
                ? "font-medium text-destructive"
                : unread > 0
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
            )}
          >
            {preview || "Start a conversation"}
          </p>
        </div>
      </div>

      <div className="ml-1 flex shrink-0 flex-col items-end gap-1">
        {isMuted && <BellOff className="size-3.5 text-muted-foreground" />}
        {unread > 0 ? (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : (
          isMine && (
            <CheckCheck className="size-4 text-muted-foreground" />
          )
        )}
      </div>
    </Link>
  );
}
