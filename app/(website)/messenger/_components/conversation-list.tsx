"use client";

import { cn } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Conversation } from "@/types/messenger";
import { ConversationItem } from "./conversation-item";
import { getConversationTitle } from "./helpers";

interface Props {
  conversations: Conversation[];
  meId: string;
  selectedId: string | null;
  pinnedIds: Set<string>;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  meId,
  selectedId,
  pinnedIds,
  loading,
}: Props) {
  const [q, setQ] = useState("");

  const { pinned, others } = useMemo(() => {
    const filtered = conversations.filter((c) => {
      if (!q.trim()) return true;
      return getConversationTitle(c, meId)
        .toLowerCase()
        .includes(q.toLowerCase());
    });
    return {
      pinned: filtered.filter((c) => pinnedIds.has(c._id)),
      others: filtered.filter((c) => !pinnedIds.has(c._id)),
    };
  }, [conversations, q, meId, pinnedIds]);

  const total = conversations.length;

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r bg-card">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-[20px] font-bold tracking-tight">
          Message <span className="text-primary">({total})</span>
        </h2>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className={cn(
              "h-9 w-full rounded-full border bg-muted/40 pl-9 pr-3 text-sm outline-none transition",
              "focus:border-primary/40 focus:bg-card",
            )}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : total === 0 ? (
          <div className="flex h-40 items-center justify-center px-6 text-center text-xs text-muted-foreground">
            No conversations yet. Tap the + button to start a chat.
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground/70">
                  PINNED
                </div>
                <div className="flex flex-col gap-0.5">
                  {pinned.map((c) => (
                    <ConversationItem
                      key={c._id}
                      conversation={c}
                      meId={meId}
                      active={selectedId === c._id}
                    />
                  ))}
                </div>
              </>
            )}

            {others.length > 0 && (
              <>
                <div className="px-3 pb-1 pt-4 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground/70">
                  ALL MESSAGE
                </div>
                <div className="flex flex-col gap-0.5">
                  {others.map((c) => (
                    <ConversationItem
                      key={c._id}
                      conversation={c}
                      meId={meId}
                      active={selectedId === c._id}
                    />
                  ))}
                </div>
              </>
            )}

            {pinned.length === 0 && others.length === 0 && (
              <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
                No conversations match &quot;{q}&quot;
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
