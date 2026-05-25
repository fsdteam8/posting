"use client";

import { Avatar } from "@/app/(website)/messenger/_components/avatar";
import { useOptionalMiniChat } from "@/components/shared/messenger/mini-chat-provider";
import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import { useMessengerSocket } from "@/hooks/features/messenger/use-messenger-socket";
import { useProfile } from "@/hooks/profile/use-profile";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/messenger";
import { format, isToday, isYesterday } from "date-fns";
import { Edit, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  accessToken: string;
  onClose: () => void;
}

const DEFAULT_AVATAR = "/features/user/default-avatar.webp";
const DEFAULT_GROUP_AVATAR =
  "/features/group/groups-default-cover-photo-2x-compressed.png";

function getTitle(c: Conversation, meId: string) {
  if (c.isGroup) return c.name || "Group chat";
  const other = c.participants.find((p) => p._id !== meId) || c.participants[0];
  return other ? `${other.firstName} ${other.lastName}` : "Conversation";
}

function getAvatar(c: Conversation, meId: string) {
  if (c.isGroup) return c.avatar?.url || DEFAULT_GROUP_AVATAR;
  const other = c.participants.find((p) => p._id !== meId) || c.participants[0];
  return other?.profileImage?.url || DEFAULT_AVATAR;
}

function formatAt(at?: string | null) {
  if (!at) return "";
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return "";
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 7) return format(d, "EEE");
  return format(d, "d MMM");
}

export function MessengerPanel({ accessToken, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");

  const { data: profile } = useProfile(accessToken);
  const meId = profile?._id;

  const { data, isLoading } = useGetConversations({ accessToken, limit: 20 });

  useMessengerSocket({ userId: meId });

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const conversations = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    if (!q.trim() || !meId) return conversations;
    return conversations.filter((c) =>
      getTitle(c, meId).toLowerCase().includes(q.toLowerCase()),
    );
  }, [conversations, q, meId]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-90 overflow-hidden rounded-2xl border bg-card shadow-xl ring-1 ring-black/5 animate-in fade-in-0 slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-[15px] font-semibold">Chats</span>
        <div className="flex items-center gap-1">
          <Link
            href="/messenger"
            onClick={onClose}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="New message"
          >
            <Edit className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="px-3 pb-2 pt-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Messenger"
            className="h-8 w-full rounded-full bg-muted/50 pl-9 pr-3 text-[12.5px] outline-none focus:bg-card focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      <div className="max-h-105 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : !meId || filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground">
            {q ? "No conversations found." : "No conversations yet."}
          </div>
        ) : (
          filtered.map((c) => (
            <Row key={c._id} c={c} meId={meId} onClose={onClose} />
          ))
        )}
      </div>

      <div className="border-t px-4 py-2.5">
        <Link
          href="/messenger"
          onClick={onClose}
          className="block cursor-pointer text-center text-xs text-primary hover:underline"
        >
          See all in Messenger
        </Link>
      </div>
    </div>
  );
}

function Row({
  c,
  meId,
  onClose,
}: {
  c: Conversation;
  meId: string;
  onClose: () => void;
}) {
  const title = getTitle(c, meId);
  const avatar = getAvatar(c, meId);
  const last = c.lastMessage;
  const lastSenderId =
    typeof last?.sender === "string"
      ? last?.sender
      : (last?.sender as { _id?: string } | undefined)?._id;
  const isMine = lastSenderId === meId;
  const unread = c.unreadCount || 0;
  const miniChat = useOptionalMiniChat();
  let preview = last?.text || "";
  if (!preview && last?.type) {
    if (last.type === "image") preview = "Sent a photo";
    else if (last.type === "video") preview = "Sent a video";
    else if (last.type === "missed-call") preview = "Missed call";
  }
  if (isMine && preview) preview = `You: ${preview}`;
  const other = c.participants.find((p) => p._id !== meId);

  return (
    <button
      type="button"
      onClick={() => {
        if (miniChat) {
          miniChat.openConversation(c._id);
          onClose();
          return;
        }
        window.location.href = `/messenger/${c._id}`;
      }}
      className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
    >
      <div className="relative shrink-0">
        <div className="relative size-11 overflow-hidden rounded-full bg-muted">
          <Avatar
            src={avatar}
            alt={title}
            sizes="44px"
            isGroup={c.isGroup}
          />
        </div>
        {!c.isGroup && other?.isOnline && (
          <span className="absolute -bottom-0.5 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[13.5px] leading-tight",
            unread > 0 ? "font-bold" : "font-semibold",
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "mt-0.5 flex items-center gap-1 truncate text-[12px] leading-snug",
            unread > 0
              ? "font-semibold text-foreground"
              : "text-muted-foreground",
          )}
        >
          <span className="truncate">{preview || "Start a conversation"}</span>
          {last?.at && (
            <>
              <span>·</span>
              <span className="shrink-0">{formatAt(last.at)}</span>
            </>
          )}
        </p>
      </div>
      {unread > 0 && (
        <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
}
