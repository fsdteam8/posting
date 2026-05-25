"use client";

import { Avatar } from "@/app/(website)/messenger/_components/avatar";
import {
  getConversationAvatar,
  getConversationTitle,
  getOtherParticipant,
} from "@/app/(website)/messenger/_components/helpers";
import { MessageBubble } from "@/app/(website)/messenger/_components/message-bubble";
import { MessageContextMenu } from "@/app/(website)/messenger/_components/message-context-menu";
import { MessageInput } from "@/app/(website)/messenger/_components/message-input";
import { ReactionsBar } from "@/app/(website)/messenger/_components/reactions-bar";
import { useCreateDirectConversation } from "@/hooks/features/messenger/api/use-create-direct-conversation";
import { useDeleteMessage } from "@/hooks/features/messenger/api/use-delete-message";
import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import { useGetMessages } from "@/hooks/features/messenger/api/use-get-messages";
import { useMarkConversationSeen } from "@/hooks/features/messenger/api/use-mark-seen";
import { useReactToMessage } from "@/hooks/features/messenger/api/use-react-to-message";
import { useSendMessage } from "@/hooks/features/messenger/api/use-send-message";
import { useMessengerSocket } from "@/hooks/features/messenger/use-messenger-socket";
import { useProfile } from "@/hooks/profile/use-profile";
import { cn } from "@/lib/utils";
import type {
  Conversation,
  Message,
  MessengerUser,
} from "@/types/messenger";
import {
  ExternalLink,
  Loader2,
  Maximize2,
  MessageCircle,
  Minus,
  User,
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

  const optimisticSender: MessengerUser | undefined = profile
    ? {
        _id: profile._id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        profileImage: profile.profileImage,
        isOnline: profile.isOnline,
      }
    : undefined;

  return (
    <MiniChatContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-0 right-2 z-60 flex max-w-[calc(100vw-1rem)] flex-row-reverse items-end gap-3 sm:right-5">
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
              optimisticSender={optimisticSender}
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
  optimisticSender,
  minimized,
  onClose,
  onToggleMinimized,
}: {
  accessToken: string;
  conversationId: string;
  conversation: Conversation | null;
  meId?: string;
  optimisticSender?: MessengerUser;
  minimized: boolean;
  onClose: () => void;
  onToggleMinimized: () => void;
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = useGetMessages({ accessToken, conversationId });
  const sendMessage = useSendMessage({ accessToken });
  const reactMessage = useReactToMessage({ accessToken });
  const deleteMessage = useDeleteMessage({ accessToken });
  const markSeen = useMarkConversationSeen({ accessToken });

  useMessengerSocket({ userId: meId, activeConversationId: conversationId });

  const title =
    conversation && meId
      ? getConversationTitle(conversation, meId)
      : "Messenger";
  const avatar =
    conversation && meId ? getConversationAvatar(conversation, meId) : "";
  const unread = conversation?.unreadCount || 0;
  const otherParticipant =
    conversation && meId ? getOtherParticipant(conversation, meId) : null;
  const profileHref = otherParticipant?.username
    ? `/public/profile/${otherParticipant.username}`
    : null;

  const seenByForMessage = useMemo(() => {
    if (!conversation || !meId) return {};

    const others = conversation.participants.filter((p) => p._id !== meId);
    const lastSeenByUser: Record<string, string> = {};

    for (const other of others) {
      for (let i = (messages.data?.data.length ?? 0) - 1; i >= 0; i--) {
        const message = messages.data?.data[i];
        if (
          message?.sender?._id === meId &&
          (message.seenBy || []).some((id) =>
            typeof id === "string" ? id === other._id : false,
          )
        ) {
          lastSeenByUser[other._id] = message._id;
          break;
        }
      }
    }

    const map: Record<string, MessengerUser[]> = {};
    for (const [userId, messageId] of Object.entries(lastSeenByUser)) {
      const user = others.find((other) => other._id === userId);
      if (!user) continue;
      if (!map[messageId]) map[messageId] = [];
      map[messageId].push(user);
    }
    return map;
  }, [conversation, meId, messages.data?.data]);

  useEffect(() => {
    if (unread > 0) markSeen.mutate({ conversationId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, unread]);

  useEffect(() => {
    const data = messages.data?.data ?? [];
    const latest = data[data.length - 1];
    if (!meId || !latest || latest.sender?._id === meId) return;
    if ((latest.seenBy || []).includes(meId)) return;
    markSeen.mutate({ conversationId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages.data?.data.at(-1)?._id, meId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.data?.data.length, minimized]);

  async function handleSend({
    text,
    files,
  }: {
    text?: string;
    files?: File[];
  }) {
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await sendMessage.mutateAsync({
          conversationId,
          file: files[i],
          text: i === 0 ? text : undefined,
          replyTo: i === 0 ? replyTo?._id ?? null : null,
          optimisticSender,
        });
      }
      setReplyTo(null);
      return;
    }
    if (text) {
      sendMessage.mutate({
        conversationId,
        text,
        replyTo: replyTo?._id ?? null,
        optimisticSender,
      });
      setReplyTo(null);
    }
  }

  return (
    <section
      className={cn(
        "pointer-events-auto w-[calc(100vw-1rem)] overflow-visible rounded-t-lg border bg-card shadow-2xl ring-1 ring-black/5 sm:w-82",
        minimized ? "h-12" : "h-113.75",
      )}
      aria-label={`${title} chat window`}
    >
      <div className="flex h-12 items-center gap-2 border-b px-3">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((open) => !open)}
            className="relative size-8 cursor-pointer overflow-hidden rounded-full bg-muted"
            aria-label="Open chat menu"
            aria-expanded={profileMenuOpen}
          >
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
          </button>

          {profileMenuOpen && (
            <div className="absolute left-0 top-10 z-50 w-48 overflow-hidden rounded-lg border bg-card py-1 shadow-xl ring-1 ring-black/5">
              {profileHref && (
                <Link
                  href={profileHref}
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-muted"
                >
                  <User className="size-4 text-muted-foreground" />
                  <span>See profile</span>
                </Link>
              )}
              <Link
                href={`/messenger/${conversationId}`}
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-muted"
              >
                <ExternalLink className="size-4 text-muted-foreground" />
                <span>Open in Messenger</span>
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleMinimized}
          className="flex min-w-0 flex-1 cursor-pointer items-center text-left"
          aria-label={minimized ? "Open chat" : "Minimize chat"}
        >
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
        <div className="flex h-101.75 min-h-0 flex-col">
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
              <div className="flex flex-col gap-1">
                {messages.data.data.map((message, index) => {
                  const previous = messages.data.data[index - 1];
                  const showAvatar =
                    !previous || previous.sender?._id !== message.sender?._id;

                  return (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      meId={meId ?? ""}
                      conversationId={conversationId}
                      showAvatar={showAvatar}
                      seenByUsers={seenByForMessage[message._id]}
                      onContextMenu={(msg, event) => {
                        event.preventDefault();
                        setContextMenu({
                          x: event.clientX,
                          y: event.clientY,
                          msg,
                        });
                        setReactionsFor({
                          x: event.clientX,
                          y: event.clientY - 60,
                          msg,
                        });
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
            )}
          </div>

          <MessageInput
            replyTo={replyTo}
            disabled={sendMessage.isPending}
            placeholder="Your message"
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
              onDelete={() =>
                deleteMessage.mutate({
                  messageId: contextMenu.msg._id,
                  conversationId,
                })
              }
            />
          )}

          {reactionsFor && (
            <div
              style={{ top: reactionsFor.y, left: reactionsFor.x }}
              className={cn("fixed z-50")}
            >
              <ReactionsBar
                onPick={(emoji) => {
                  reactMessage.mutate({
                    conversationId,
                    messageId: reactionsFor.msg._id,
                    emoji,
                  });
                  setReactionsFor(null);
                }}
                onMore={() => setReactionsFor(null)}
                onClose={() => setReactionsFor(null)}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
