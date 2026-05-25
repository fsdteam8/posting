"use client";

import { Avatar } from "@/app/(website)/messenger/_components/avatar";
import {
  getConversationAvatar,
  getConversationTitle,
} from "@/app/(website)/messenger/_components/helpers";
import { useCreateDirectConversation } from "@/hooks/features/messenger/api/use-create-direct-conversation";
import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import { useGetMessages } from "@/hooks/features/messenger/api/use-get-messages";
import { useMarkConversationSeen } from "@/hooks/features/messenger/api/use-mark-seen";
import { useSendMessage } from "@/hooks/features/messenger/api/use-send-message";
import { useMessengerSocket } from "@/hooks/features/messenger/use-messenger-socket";
import { useProfile } from "@/hooks/profile/use-profile";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/types/messenger";
import { format } from "date-fns";
import {
  ImageIcon,
  Loader2,
  Maximize2,
  MessageCircle,
  Minus,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type MiniChatWindow = {
  conversationId: string;
  minimized: boolean;
};

type MiniChatContextValue = {
  openConversation: (conversationId: string) => void;
  openDirectChat: (userId: string) => Promise<string | null>;
  isOpeningDirect: boolean;
};

const MiniChatContext = createContext<MiniChatContextValue | null>(null);

interface Props {
  accessToken: string;
  children: React.ReactNode;
}

export function MiniChatProvider({ accessToken, children }: Props) {
  const [windows, setWindows] = useState<MiniChatWindow[]>([]);
  const { data: profile } = useProfile(accessToken);
  const { data: conversationsData } = useGetConversations({
    accessToken,
    limit: 50,
  });
  const createDirect = useCreateDirectConversation({ accessToken });

  const conversations = useMemo(
    () => conversationsData?.data ?? [],
    [conversationsData],
  );

  useMessengerSocket({ userId: profile?._id });

  const openConversation = useCallback((conversationId: string) => {
    setWindows((current) => {
      const existing = current.find((w) => w.conversationId === conversationId);
      if (existing) {
        return current.map((w) =>
          w.conversationId === conversationId ? { ...w, minimized: false } : w,
        );
      }
      return [...current, { conversationId, minimized: false }].slice(-3);
    });
  }, []);

  const openDirectChat = useCallback(
    async (userId: string) => {
      const res = await createDirect.mutateAsync({ userId });
      const conversationId = res?.data?._id ?? null;
      if (conversationId) openConversation(conversationId);
      return conversationId;
    },
    [createDirect, openConversation],
  );

  const closeConversation = useCallback((conversationId: string) => {
    setWindows((current) =>
      current.filter((w) => w.conversationId !== conversationId),
    );
  }, []);

  const toggleMinimized = useCallback((conversationId: string) => {
    setWindows((current) =>
      current.map((w) =>
        w.conversationId === conversationId
          ? { ...w, minimized: !w.minimized }
          : w,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      openConversation,
      openDirectChat,
      isOpeningDirect: createDirect.isPending,
    }),
    [createDirect.isPending, openConversation, openDirectChat],
  );

  return (
    <MiniChatContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-0 right-2 z-[60] flex max-w-[calc(100vw-1rem)] flex-row-reverse items-end gap-3 sm:right-5">
        {windows.map((window) => {
          const conversation =
            conversations.find((c) => c._id === window.conversationId) ?? null;
          return (
            <MiniChatBox
              key={window.conversationId}
              accessToken={accessToken}
              conversationId={window.conversationId}
              conversation={conversation}
              meId={profile?._id}
              minimized={window.minimized}
              onClose={() => closeConversation(window.conversationId)}
              onToggleMinimized={() => toggleMinimized(window.conversationId)}
            />
          );
        })}
      </div>
    </MiniChatContext.Provider>
  );
}

export function useOptionalMiniChat() {
  return useContext(MiniChatContext);
}

function MiniChatBox({
  accessToken,
  conversationId,
  conversation,
  meId,
  minimized,
  onClose,
  onToggleMinimized,
}: {
  accessToken: string;
  conversationId: string;
  conversation: Conversation | null;
  meId?: string;
  minimized: boolean;
  onClose: () => void;
  onToggleMinimized: () => void;
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = useGetMessages({ accessToken, conversationId });
  const sendMessage = useSendMessage({ accessToken });
  const markSeen = useMarkConversationSeen({ accessToken });

  useMessengerSocket({ userId: meId, activeConversationId: conversationId });

  const title =
    conversation && meId
      ? getConversationTitle(conversation, meId)
      : "Messenger";
  const avatar =
    conversation && meId ? getConversationAvatar(conversation, meId) : "";
  const unread = conversation?.unreadCount || 0;

  useEffect(() => {
    if (unread > 0) markSeen.mutate({ conversationId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, unread]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.data?.data.length, minimized]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate({ conversationId, text: trimmed });
    setText("");
  }

  return (
    <section
      className={cn(
        "pointer-events-auto w-[calc(100vw-1rem)] overflow-hidden rounded-t-lg border bg-card shadow-2xl ring-1 ring-black/5 sm:w-82",
        minimized ? "h-12" : "h-[455px]",
      )}
      aria-label={`${title} chat window`}
    >
      <div className="flex h-12 items-center gap-2 border-b px-3">
        <button
          type="button"
          onClick={onToggleMinimized}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
          aria-label={minimized ? "Open chat" : "Minimize chat"}
        >
          <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
            {avatar ? (
              <Avatar
                src={avatar}
                alt={title}
                sizes="32px"
                isGroup={conversation?.isGroup}
              />
            ) : (
              <MessageCircle className="m-2 size-4 text-muted-foreground" />
            )}
          </div>
          <span className="min-w-0 truncate text-[13px] font-semibold">
            {title}
          </span>
        </button>

        <Link
          href={`/messenger/${conversationId}`}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Open in Messenger"
          title="Open in Messenger"
        >
          <Maximize2 className="size-4" />
        </Link>
        <button
          type="button"
          onClick={onToggleMinimized}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Minimize"
          title="Minimize"
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
          title="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      {!minimized && (
        <div className="flex h-[407px] min-h-0 flex-col">
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
          >
            {messages.isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : !messages.data?.data.length ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <MessageCircle className="size-8" />
                <span>Start a conversation</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {messages.data.data.map((message) => (
                  <MiniMessageBubble
                    key={message._id}
                    message={message}
                    isMine={message.sender?._id === meId}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t p-2">
            <div className="flex items-center gap-2 rounded-full bg-muted/60 pl-3 pr-1.5">
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Aa"
                className="min-w-0 flex-1 bg-transparent py-2 text-[13px] outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() || sendMessage.isPending}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full transition",
                  text.trim() && !sendMessage.isPending
                    ? "cursor-pointer text-primary hover:bg-primary/10"
                    : "cursor-not-allowed text-muted-foreground",
                )}
                aria-label="Send"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MiniMessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  const time = format(new Date(message.createdAt), "h:mm a");
  const hasMedia = message.media?.url;

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] overflow-hidden rounded-2xl px-3 py-2 text-[13px] leading-snug",
          isMine
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        {message.isDeleted ? (
          <p className="italic opacity-75">Message deleted</p>
        ) : (
          <>
            {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
            {hasMedia && <MiniMessageMedia message={message} isMine={isMine} />}
          </>
        )}
        <p
          className={cn(
            "mt-1 text-[10px]",
            isMine ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

function MiniMessageMedia({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  if (!message.media?.url) return null;

  if (message.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={message.media.url}
        alt={message.media.fileName || "Image message"}
        className="mt-1 max-h-40 rounded-lg object-cover"
      />
    );
  }

  if (message.type === "audio") {
    return (
      <audio controls className="mt-1 w-48 max-w-full">
        <source src={message.media.url} type={message.media.mimeType} />
      </audio>
    );
  }

  if (message.type === "video") {
    return (
      <video controls className="mt-1 max-h-40 rounded-lg">
        <source src={message.media.url} type={message.media.mimeType} />
      </video>
    );
  }

  return (
    <a
      href={message.media.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs underline-offset-2 hover:underline",
        isMine ? "bg-primary-foreground/15" : "bg-background",
      )}
    >
      <ImageIcon className="size-4 shrink-0" />
      <span className="truncate">{message.media.fileName || "Attachment"}</span>
    </a>
  );
}
