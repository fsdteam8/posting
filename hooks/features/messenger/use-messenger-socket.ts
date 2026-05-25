"use client";

import type {
  Conversation,
  ConversationsResponse,
  Message,
  MessagesResponse,
} from "@/types/messenger";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getMessengerSocket } from "./socket-singleton";

interface MessageNewPayload {
  conversationId: string;
  message: Message;
}

interface ReactionPayload {
  conversationId: string;
  messageId: string;
  userId: string;
  emoji: string | null;
  reactions: Message["reactions"];
}

interface DeletePayload {
  conversationId: string;
  messageId: string;
  forEveryone: boolean;
}

interface SeenPayload {
  conversationId: string;
  userId: string;
}

interface UseMessengerSocketParams {
  userId: string | null | undefined;
  activeConversationId?: string | null;
}

export function useMessengerSocket({
  userId,
  activeConversationId,
}: UseMessengerSocketParams) {
  const qc = useQueryClient();
  const joinedRef = useRef<Set<string>>(new Set());

  // Connect / disconnect
  useEffect(() => {
    if (!userId) return;
    const socket = getMessengerSocket(userId);

    function onConvUpdated({ conversationId, message }: MessageNewPayload) {
      // Patch the conversations list cache
      qc.setQueriesData<ConversationsResponse>(
        { queryKey: ["messenger", "conversations"] },
        (old) => {
          if (!old) return old;
          const next = [...old.data];
          const idx = next.findIndex((c) => c._id === conversationId);
          if (idx === -1) {
            qc.invalidateQueries({ queryKey: ["messenger", "conversations"] });
            return old;
          }
          const updated: Conversation = {
            ...next[idx],
            lastMessage: {
              text:
                message.text ||
                (message.type === "text" ? "" : `[${message.type}]`),
              sender:
                typeof message.sender === "string"
                  ? message.sender
                  : message.sender,
              at: message.createdAt,
              type: message.type,
            },
            unreadCount:
              activeConversationId === conversationId
                ? 0
                : (next[idx].unreadCount || 0) + 1,
            updatedAt: message.createdAt,
          };
          next.splice(idx, 1);
          next.unshift(updated);
          return { ...old, data: next };
        },
      );
    }

    function onMessageNew({ conversationId, message }: MessageNewPayload) {
      qc.setQueriesData<MessagesResponse>(
        { queryKey: ["messenger", "messages", conversationId] },
        (old) => {
          if (!old) return old;
          if (old.data.some((m) => m._id === message._id)) return old;
          const senderId =
            typeof message.sender === "string"
              ? message.sender
              : message.sender?._id;
          if (senderId === userId) {
            const tempIndex = old.data.findIndex(
              (m) =>
                m.sendStatus === "waiting" &&
                m.text === message.text &&
                m.type === message.type,
            );
            if (tempIndex !== -1) {
              const next = [...old.data];
              next[tempIndex] = { ...message, sendStatus: "sent" };
              return { ...old, data: next };
            }
          }
          return { ...old, data: [...old.data, message] };
        },
      );
    }

    function onMessageDeleted({ conversationId, messageId }: DeletePayload) {
      qc.setQueriesData<MessagesResponse>(
        { queryKey: ["messenger", "messages", conversationId] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((m) => m._id !== messageId),
          };
        },
      );
    }

    function onReaction({
      conversationId,
      messageId,
      reactions,
    }: ReactionPayload) {
      qc.setQueriesData<MessagesResponse>(
        { queryKey: ["messenger", "messages", conversationId] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((m) =>
              m._id === messageId ? { ...m, reactions: reactions || [] } : m,
            ),
          };
        },
      );
    }

    function onSeen({ conversationId, userId: seenUserId }: SeenPayload) {
      qc.setQueriesData<MessagesResponse>(
        { queryKey: ["messenger", "messages", conversationId] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((message) => {
              const senderId =
                typeof message.sender === "string"
                  ? message.sender
                  : message.sender?._id;
              if (senderId === seenUserId) return message;
              if ((message.seenBy || []).includes(seenUserId)) return message;
              return {
                ...message,
                seenBy: [...(message.seenBy || []), seenUserId],
              };
            }),
          };
        },
      );
    }

    socket.on("connect", () => {
      socket.emit("joinChatRoom", userId);
    });
    socket.on("conversation:updated", onConvUpdated);
    socket.on("message:new", onMessageNew);
    socket.on("message:deleted", onMessageDeleted);
    socket.on("message:reaction", onReaction);
    socket.on("conversation:seen", onSeen);

    // If socket already connected, ensure room joined
    if (socket.connected) {
      socket.emit("joinChatRoom", userId);
    }

    return () => {
      socket.off("conversation:updated", onConvUpdated);
      socket.off("message:new", onMessageNew);
      socket.off("message:deleted", onMessageDeleted);
      socket.off("message:reaction", onReaction);
      socket.off("conversation:seen", onSeen);
    };
  }, [userId, qc, activeConversationId]);

  // Join active conversation
  useEffect(() => {
    if (!userId || !activeConversationId) return;
    const socket = getMessengerSocket(userId);
    if (!joinedRef.current.has(activeConversationId)) {
      socket.emit("joinConversation", activeConversationId);
      joinedRef.current.add(activeConversationId);
    }
  }, [userId, activeConversationId]);
}
