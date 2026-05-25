"use client";

import { useDeleteMessage } from "@/hooks/features/messenger/api/use-delete-message";
import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import { useGetMessages } from "@/hooks/features/messenger/api/use-get-messages";
import { useMarkConversationSeen } from "@/hooks/features/messenger/api/use-mark-seen";
import { useReactToMessage } from "@/hooks/features/messenger/api/use-react-to-message";
import { useSendMessage } from "@/hooks/features/messenger/api/use-send-message";
import { useEffect, useMemo, useState } from "react";
import { ChatArea } from "./chat-area";
import { DetailsPanel } from "./details-panel";
import { EmptyChat } from "./empty-chat";
import { getOtherParticipant } from "./helpers";
import { useMessenger } from "./messenger-context";

interface Props {
  conversationId: string;
}

export function ConversationPageClient({ conversationId }: Props) {
  const { accessToken, me, openCall, themes } = useMessenger();
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const themeId = themes[conversationId];

  const { data: convData } = useGetConversations({ accessToken });
  const conversation = useMemo(
    () =>
      (convData?.data ?? []).find((c) => c._id === conversationId) || null,
    [convData, conversationId],
  );

  const { data: msgsData, isLoading: msgsLoading } = useGetMessages({
    accessToken,
    conversationId,
  });
  const messages = useMemo(() => msgsData?.data ?? [], [msgsData]);

  const sendMutation = useSendMessage({ accessToken });
  const reactMutation = useReactToMessage({ accessToken });
  const deleteMutation = useDeleteMessage({ accessToken });
  const markSeen = useMarkConversationSeen({ accessToken });

  // Mark seen on open / when new messages arrive
  useEffect(() => {
    if (!conversationId) return;
    if (conversation && (conversation.unreadCount || 0) > 0) {
      markSeen.mutate({ conversationId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, conversation?.unreadCount]);

  useEffect(() => {
    const latest = messages[messages.length - 1];
    if (!conversationId || !latest || latest.sender?._id === me._id) return;
    if ((latest.seenBy || []).includes(me._id)) return;
    markSeen.mutate({ conversationId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages[messages.length - 1]?._id, me._id]);

  if (!conversation) {
    return <EmptyChat />;
  }

  return (
    <>
      <ChatArea
        conversation={conversation}
        messages={messages}
        meId={me._id}
        loading={msgsLoading}
        sending={sendMutation.isPending}
        themeId={themeId}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        onToggleDetails={() => setDetailsOpen((v) => !v)}
        onAudioCall={() => {
          const other = getOtherParticipant(conversation, me._id);
          if (other) openCall("audio", other);
        }}
        onVideoCall={() => {
          const other = getOtherParticipant(conversation, me._id);
          if (other) openCall("video", other);
        }}
        onSend={async ({ text, files, replyTo }) => {
          const convId = conversation._id;
          if (files && files.length > 0) {
            // Send each file as its own message; the caption rides on the first one.
            for (let i = 0; i < files.length; i++) {
              await sendMutation.mutateAsync({
                conversationId: convId,
                file: files[i],
                text: i === 0 ? text : undefined,
                replyTo: i === 0 ? replyTo ?? null : null,
                optimisticSender: me,
              });
            }
            return;
          }
          if (text) {
            sendMutation.mutate({
              conversationId: convId,
              text,
              replyTo: replyTo ?? null,
              optimisticSender: me,
            });
          }
        }}
        onReact={(messageId, emoji) =>
          reactMutation.mutate({
            conversationId: conversation._id,
            messageId,
            emoji,
          })
        }
        onDelete={(messageId) =>
          deleteMutation.mutate({
            messageId,
            conversationId: conversation._id,
          })
        }
      />

      {detailsOpen && (
        <DetailsPanel
          conversation={conversation}
          messages={messages}
          meId={me._id}
          onOpenSearch={() => setSearchOpen(true)}
        />
      )}
    </>
  );
}
