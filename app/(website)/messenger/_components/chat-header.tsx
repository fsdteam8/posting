"use client";

import type { Conversation } from "@/types/messenger";
import { ArrowLeft, Phone, Search, User, Video } from "lucide-react";
import Link from "next/link";
import { Avatar } from "./avatar";
import {
  displayNameInConversation,
  getConversationAvatar,
  getOtherParticipant,
} from "./helpers";
import { useMessenger } from "./messenger-context";

interface Props {
  conversation: Conversation;
  meId: string;
  onToggleDetails: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onOpenSearch: () => void;
  /** Where the mobile back arrow points. Defaults to the social inbox. */
  backHref?: string;
  /** Hide the call buttons when the chat type doesn't support them. */
  showCallButtons?: boolean;
  /** Hide the details toggle when the surface doesn't render a details panel. */
  showDetailsToggle?: boolean;
}

export function ChatHeader({
  conversation,
  meId,
  onToggleDetails,
  onAudioCall,
  onVideoCall,
  onOpenSearch,
  backHref = "/messenger",
  showCallButtons = true,
  showDetailsToggle = true,
}: Props) {
  const { presence } = useMessenger();
  const isGroup = conversation.isGroup;
  const other = getOtherParticipant(conversation, meId);
  const title = isGroup
    ? conversation.name || "Group"
    : other
      ? displayNameInConversation(other, conversation._id)
      : "Conversation";
  const avatar = getConversationAvatar(conversation, meId);

  const username = isGroup
    ? `${conversation.participants.length} members`
    : other?.username
      ? `@${other.username}`
      : "";

  const livePresence = other ? presence[other._id] : undefined;
  const isOnline = livePresence ? livePresence.isOnline : !!other?.isOnline;

  return (
    <div className="flex items-center justify-between gap-2 border-b bg-card px-3 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Back to conversation list (mobile only) */}
        <Link
          href={backHref}
          aria-label="Back to messages"
          className="-ml-1 flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted sm:size-11">
          <Avatar src={avatar} alt={title} sizes="44px" isGroup={isGroup} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-semibold leading-tight sm:text-[15px]">
            {title}
          </p>
          {username && (
            <p className="truncate text-[11.5px] text-muted-foreground leading-tight">
              {username}
            </p>
          )}
          {!isGroup && isOnline && (
            <p className="flex items-center gap-1 text-[11px] leading-tight text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active now
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground sm:flex"
          aria-label="Search in conversation"
        >
          <Search className="size-5" />
        </button>
        {showCallButtons && (
          <>
            <button
              type="button"
              onClick={onAudioCall}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Audio call"
            >
              <Phone className="size-5" />
            </button>
            <button
              type="button"
              onClick={onVideoCall}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Video call"
            >
              <Video className="size-5" />
            </button>
          </>
        )}
        {showDetailsToggle && (
          <button
            type="button"
            onClick={onToggleDetails}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Toggle details"
          >
            <User className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
