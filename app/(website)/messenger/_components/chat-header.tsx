"use client";

import type { Conversation } from "@/types/messenger";
import { Phone, Search, User, Video } from "lucide-react";
import { Avatar } from "./avatar";
import {
  displayNameInConversation,
  getConversationAvatar,
  getOtherParticipant,
} from "./helpers";

interface Props {
  conversation: Conversation;
  meId: string;
  onToggleDetails: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onOpenSearch: () => void;
}

export function ChatHeader({
  conversation,
  meId,
  onToggleDetails,
  onAudioCall,
  onVideoCall,
  onOpenSearch,
}: Props) {
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

  return (
    <div className="flex items-center justify-between border-b bg-card px-5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
          <Avatar src={avatar} alt={title} sizes="44px" isGroup={isGroup} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight">
            {title}
          </p>
          {username && (
            <p className="truncate text-[11.5px] text-muted-foreground leading-tight">
              {username}
            </p>
          )}
          {other?.isOnline && (
            <p className="flex items-center gap-1 text-[11px] leading-tight text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active now
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Search in conversation"
        >
          <Search className="size-5" />
        </button>
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
        <button
          type="button"
          onClick={onToggleDetails}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Toggle details"
        >
          <User className="size-5" />
        </button>
      </div>
    </div>
  );
}
