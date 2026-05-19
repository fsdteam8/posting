"use client";

import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import type { Conversation } from "@/types/messenger";
import { formatDistanceToNowStrict } from "date-fns";
import { Loader2, Phone, PhoneMissed, Video } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "./avatar";
import { getConversationAvatar, getConversationTitle } from "./helpers";
import { useMessenger } from "./messenger-context";

type Row = {
  conversation: Conversation;
  isMissed: boolean;
  kind: "audio" | "video";
  age: number;
};

export function CallsView() {
  const { accessToken, me } = useMessenger();
  const { data, isLoading } = useGetConversations({ accessToken });
  const conversations = useMemo(() => data?.data ?? [], [data]);
  const [mountedAt] = useState(() => Date.now());

  const rows: Row[] = useMemo(() => {
    return conversations
      .filter(
        (c) =>
          c.lastMessage?.type === "missed-call" ||
          c.lastMessage?.type === "audio" ||
          c.lastMessage?.type === "video",
      )
      .map((c) => {
        const t = c.lastMessage?.type;
        return {
          conversation: c,
          isMissed: t === "missed-call",
          kind: t === "video" ? "video" : "audio",
          age: c.lastMessage?.at
            ? mountedAt - new Date(c.lastMessage.at).getTime()
            : Number.MAX_SAFE_INTEGER,
        };
      });
  }, [conversations, mountedAt]);

  const news = rows.filter((r) => r.age < 24 * 60 * 60 * 1000);
  const earlier = rows.filter((r) => r.age >= 24 * 60 * 60 * 1000);

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto bg-card px-8 py-6">
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center text-[13px] text-muted-foreground">
          No calls yet.
        </div>
      ) : (
        <>
          {news.length > 0 && <Section title="New" rows={news} meId={me._id} />}
          {earlier.length > 0 && (
            <Section title="Earlier" rows={earlier} meId={me._id} />
          )}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  rows,
  meId,
}: {
  title: string;
  rows: Row[];
  meId: string;
}) {
  return (
    <div className="mt-2">
      <h3 className="text-[16px] font-semibold text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3 flex flex-col gap-2">
        {rows.map((r) => (
          <RowItem key={r.conversation._id} row={r} meId={meId} />
        ))}
      </div>
    </div>
  );
}

function RowItem({ row, meId }: { row: Row; meId: string }) {
  const { conversation, isMissed, kind } = row;
  const title = getConversationTitle(conversation, meId);
  const avatar = getConversationAvatar(conversation, meId);
  const ago = conversation.lastMessage?.at
    ? formatDistanceToNowStrict(new Date(conversation.lastMessage.at), {
        addSuffix: false,
      })
    : "";

  return (
    <Link
      href={`/messenger/${conversation._id}`}
      className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 transition hover:bg-muted/40"
    >
      <div className="flex items-center gap-3">
        <div className="relative size-12 overflow-hidden rounded-full bg-muted">
          <Avatar
            src={avatar}
            alt={title}
            sizes="48px"
            isGroup={conversation.isGroup}
          />
        </div>
        <div>
          <p className="text-[15px] font-semibold leading-tight">{title}</p>
          <p className="flex items-center gap-1 text-[12px] leading-tight text-muted-foreground">
            {isMissed && (
              <PhoneMissed className="size-3.5 text-destructive" />
            )}
            {isMissed
              ? `Missed ${kind} call`
              : `${kind === "video" ? "Video" : "Audio"} call`}
            {ago && <span>· {ago}</span>}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={kind}
      >
        {kind === "video" ? (
          <Video className="size-5" />
        ) : (
          <Phone className="size-5" />
        )}
      </button>
    </Link>
  );
}
