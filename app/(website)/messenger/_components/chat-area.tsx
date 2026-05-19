"use client";

import { cn } from "@/lib/utils";
import type { Conversation, Message, MessengerUser } from "@/types/messenger";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatHeader } from "./chat-header";
import { getThemeById } from "./constants";
import { MessageBubble } from "./message-bubble";
import { MessageContextMenu } from "./message-context-menu";
import { MessageInput } from "./message-input";
import { ReactionsBar } from "./reactions-bar";

interface Props {
  conversation: Conversation;
  messages: Message[];
  meId: string;
  loading?: boolean;
  sending?: boolean;
  themeId?: string | null;
  onToggleDetails: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onSend: (args: {
    text?: string;
    files?: File[];
    replyTo?: string | null;
  }) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDelete: (messageId: string) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
}

export function ChatArea({
  conversation,
  messages,
  meId,
  loading,
  sending,
  themeId,
  onToggleDetails,
  onAudioCall,
  onVideoCall,
  onSend,
  onReact,
  onDelete,
  searchOpen,
  setSearchOpen,
}: Props) {
  const theme = getThemeById(themeId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    msg: Message;
  } | null>(null);
  const [reactionsFor, setReactionsFor] = useState<{
    x: number;
    y: number;
    msg: Message;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const others = useMemo(
    () => conversation.participants.filter((p) => p._id !== meId),
    [conversation.participants, meId],
  );

  // Compute the "last message seen by user X" map → reverse to (messageId → users[])
  const seenByForMessage = useMemo(() => {
    const lastSeenByUser: Record<string, string> = {};
    for (const other of others) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (
          m.sender?._id === meId &&
          (m.seenBy || []).some((id) =>
            typeof id === "string" ? id === other._id : false,
          )
        ) {
          lastSeenByUser[other._id] = m._id;
          break;
        }
      }
    }
    const map: Record<string, MessengerUser[]> = {};
    for (const [userId, msgId] of Object.entries(lastSeenByUser)) {
      const u = others.find((o) => o._id === userId);
      if (!u) continue;
      if (!map[msgId]) map[msgId] = [];
      map[msgId].push(u);
    }
    return map;
  }, [messages, others, meId]);

  const visible = useMemo(() => {
    if (!searchOpen || !searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter((m) => (m.text || "").toLowerCase().includes(q));
  }, [messages, searchQuery, searchOpen]);

  // Group messages by day
  const grouped = useMemo(() => {
    const out: { date: string; items: Message[] }[] = [];
    for (const m of visible) {
      if (!m.createdAt) continue;
      const d = new Date(m.createdAt);
      const key = d.toDateString();
      const last = out[out.length - 1];
      if (last && last.date === key) last.items.push(m);
      else out.push({ date: key, items: [m] });
    }
    return out;
  }, [visible]);

  function handleSend({ text, files }: { text?: string; files?: File[] }) {
    onSend({ text, files, replyTo: replyTo?._id || null });
    setReplyTo(null);
  }

  return (
    <div className="relative flex h-full flex-1 flex-col bg-card">
      <ChatHeader
        conversation={conversation}
        meId={meId}
        onToggleDetails={onToggleDetails}
        onAudioCall={onAudioCall}
        onVideoCall={onVideoCall}
        onOpenSearch={() => setSearchOpen(!searchOpen)}
      />

      {searchOpen && (
        <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in conversation"
              className="h-9 w-full rounded-full border bg-card pl-9 pr-3 text-[13px] outline-none focus:border-primary/40"
            />
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {searchQuery ? `${visible.length} result(s)` : ""}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(false);
            }}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close search"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto px-3 py-4 sm:px-6",
          theme && "bg-linear-to-br",
          theme?.color,
        )}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-1">
          {loading && messages.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {searchOpen && searchQuery
                ? "No messages match your search."
                : "Say hi — no messages yet."}
            </div>
          ) : (
            grouped.map((day, di) => (
              <div key={di} className="flex flex-col gap-1">
                <div className="my-3 flex items-center justify-center">
                  <span
                    className={cn(
                      "rounded-full px-3 py-0.5 text-[10.5px] font-medium text-muted-foreground",
                      theme ? "bg-card/70 backdrop-blur-sm" : "bg-muted/60",
                    )}
                  >
                    {new Date(day.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                {day.items.map((m, i) => {
                  const prev = day.items[i - 1];
                  const showAvatar =
                    !prev || prev.sender?._id !== m.sender?._id;
                  return (
                    <MessageBubble
                      key={m._id}
                      message={m}
                      meId={meId}
                      conversationId={conversation._id}
                      showAvatar={showAvatar}
                      seenByUsers={seenByForMessage[m._id]}
                      onContextMenu={(msg, e) => {
                        e.preventDefault();
                        const x = e.clientX;
                        const y = e.clientY;
                        setContextMenu({ x, y, msg });
                        setReactionsFor({ x, y: y - 60, msg });
                      }}
                      onReact={(msg) =>
                        setReactionsFor({
                          x: window.innerWidth / 2 - 120,
                          y: window.innerHeight / 2,
                          msg,
                        })
                      }
                      onReply={(msg) => setReplyTo(msg)}
                    />
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      <MessageInput
        replyTo={replyTo}
        disabled={sending}
        onClearReply={() => setReplyTo(null)}
        onSend={handleSend}
      />

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isMine={contextMenu.msg.sender?._id === meId}
          onClose={() => {
            setContextMenu(null);
            setReactionsFor(null);
          }}
          onReply={() => setReplyTo(contextMenu.msg)}
          onCopy={() => {
            if (contextMenu.msg.text) {
              navigator.clipboard.writeText(contextMenu.msg.text);
            }
          }}
          onForward={() => {}}
          onDelete={() => onDelete(contextMenu.msg._id)}
        />
      )}

      {reactionsFor && (
        <div
          style={{ top: reactionsFor.y, left: reactionsFor.x }}
          className={cn("fixed z-50")}
        >
          <ReactionsBar
            onPick={(em) => {
              onReact(reactionsFor.msg._id, em);
              setReactionsFor(null);
            }}
            onMore={() => setReactionsFor(null)}
            onClose={() => setReactionsFor(null)}
          />
        </div>
      )}
    </div>
  );
}
