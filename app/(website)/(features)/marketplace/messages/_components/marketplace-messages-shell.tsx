"use client";

/**
 * MarketplaceMessagesShell — CLIENT COMPONENT
 *
 * The two-column shell for the marketplace inbox:
 *   - Left:  conversation list filtered to conversationType="marketplace"
 *   - Right: the selected conversation (or an empty state)
 *
 * Reuses the social messenger's ConversationList + ChatArea so the chat UX
 * is consistent across the two inboxes, but everything that's social-only
 * (themes, nicknames, calls, pinned, group dialogs) is intentionally absent.
 *
 * Real-time updates come from the same socket the social messenger uses;
 * `useMessengerSocket` updates the shared React Query cache by query key, so
 * incoming marketplace messages refresh this list automatically.
 */

import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import { useMessengerSocket } from "@/hooks/features/messenger/use-messenger-socket";
import type { MessengerUser } from "@/types/messenger";
import { ArrowLeft, MessageCircle, Store } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import { ConversationList } from "@/app/(website)/messenger/_components/conversation-list";
import { MarketplaceMessagesProvider } from "./marketplace-messages-context";

interface Props {
  accessToken: string;
  me: MessengerUser;
  children: React.ReactNode;
}

const BASE_PATH = "/marketplace/messages";

export function MarketplaceMessagesShell({ accessToken, me, children }: Props) {
  const params = useParams<{ conversationId?: string }>();
  const pathname = usePathname();

  const { data: convData, isLoading: convLoading } = useGetConversations({
    accessToken,
    type: "marketplace",
    limit: 50,
  });
  const conversations = useMemo(() => convData?.data ?? [], [convData]);

  const selectedId = params?.conversationId || null;

  // Wire the same socket the social messenger uses so incoming
  // marketplace messages refresh the list in real-time.
  useMessengerSocket({
    userId: me._id,
    activeConversationId: selectedId,
  });

  const onConversationRoute = !!selectedId;
  const onIndex = pathname === BASE_PATH;

  return (
    <MarketplaceMessagesProvider accessToken={accessToken} me={me}>
      <div className="relative flex h-[calc(100vh-56px)] w-full max-w-full overflow-hidden bg-background">
        {/* Conv list column. Hidden on mobile when a conversation is open. */}
        <div
          className={
            onConversationRoute
              ? "hidden min-h-0 flex-col md:flex md:w-80 md:shrink-0"
              : "flex w-full min-h-0 flex-col md:w-80 md:shrink-0"
          }
        >
          {/* Header strip: back to marketplace + section title */}
          <div className="flex items-center gap-2 border-b bg-card px-4 py-3">
            <Link
              href="/marketplace"
              aria-label="Back to marketplace"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex min-w-0 items-center gap-1.5">
              <Store className="size-4 text-blue-600 shrink-0" />
              <span className="truncate text-[13.5px] font-semibold">
                Marketplace messages
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <ConversationList
              conversations={conversations}
              meId={me._id}
              selectedId={selectedId}
              pinnedIds={new Set<string>()}
              loading={convLoading}
              title="Marketplace"
              basePath={BASE_PATH}
            />
          </div>
        </div>

        {/* Chat column. Hidden on mobile when on the index route so the conv list takes the full screen. */}
        <div
          className={
            onConversationRoute
              ? "flex min-w-0 flex-1"
              : "hidden min-w-0 flex-1 md:flex"
          }
        >
          {onIndex && conversations.length === 0 && !convLoading ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="text-center max-w-sm">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                  <MessageCircle className="size-5 text-muted-foreground" />
                </div>
                <p className="text-[14px] font-semibold">
                  No marketplace messages yet
                </p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  When you message a seller or someone messages you about a
                  listing, the conversation will show up here.
                </p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </MarketplaceMessagesProvider>
  );
}
