"use client";

/**
 * MarketplaceConversationClient
 *
 * Renders the chat surface for a single marketplace conversation. Mirrors
 * the social messenger's ConversationPageClient but:
 *   - Fetches with type="marketplace" so the lookup stays in the marketplace cache.
 *   - Hides social-only chrome (call buttons, details panel, themes).
 *   - Shows a listing banner above the chat so the seller and buyer always
 *     have the listing they are talking about in view.
 */

import { ConfirmDialog } from "@/app/(website)/messenger/_components/confirm-dialog";
import { ChatArea } from "@/app/(website)/messenger/_components/chat-area";
import { useChangeListingStatus } from "@/hooks/features/marketplace/api/use-change-listing-status";
import { useDeleteMessage } from "@/hooks/features/messenger/api/use-delete-message";
import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import { useGetMessages } from "@/hooks/features/messenger/api/use-get-messages";
import { useMarkConversationSeen } from "@/hooks/features/messenger/api/use-mark-seen";
import { useReactToMessage } from "@/hooks/features/messenger/api/use-react-to-message";
import { useSendMessage } from "@/hooks/features/messenger/api/use-send-message";
import type { Conversation, MessengerUser } from "@/types/messenger";
import { CheckCircle2, ExternalLink, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * Listings are populated by the backend's getMyConversations and ride on
 * Conversation as an extra optional field. Type it inline so we don't have to
 * widen the shared Conversation type used by the social messenger.
 */
type ListingSummary = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  listingStatus: string;
  /** Owner of the listing — used to gate the "Mark as sold" control. */
  seller?: string;
  photos?: { url: string; public_id: string }[];
};

type MarketplaceConversation = Conversation & {
  listing?: ListingSummary | null;
};

interface Props {
  conversationId: string;
  accessToken: string;
  me: MessengerUser;
}

export function MarketplaceConversationClient({
  conversationId,
  accessToken,
  me,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [confirmSoldOpen, setConfirmSoldOpen] = useState(false);

  const changeStatus = useChangeListingStatus({ accessToken });

  const { data: convData } = useGetConversations({
    accessToken,
    type: "marketplace",
    limit: 50,
  });
  const conversation = useMemo(
    () =>
      ((convData?.data ?? []) as MarketplaceConversation[]).find(
        (c) => c._id === conversationId,
      ) || null,
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

  useEffect(() => {
    if (!conversationId) return;
    if (conversation && (conversation.unreadCount || 0) > 0) {
      markSeen.mutate({ conversationId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, conversation?.unreadCount]);

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading conversation…
      </div>
    );
  }

  const listing = conversation.listing;
  const photo = listing?.photos?.[0]?.url;

  // Determine if the viewer is the seller. The chat partner becomes the
  // buyer candidate when the viewer chooses to mark the listing as sold.
  const isSeller =
    !!listing?.seller && listing.seller.toString() === me._id.toString();
  const buyerCandidate =
    conversation.participants.find((p) => p._id !== me._id) || null;
  const buyerName = buyerCandidate
    ? `${buyerCandidate.firstName ?? ""} ${buyerCandidate.lastName ?? ""}`.trim()
    : "this buyer";

  // Only allow marking as sold from a still-active listing. Once it's "sold",
  // "shipped" or "archived", the action shouldn't appear.
  const canMarkSold =
    isSeller &&
    listing &&
    (listing.listingStatus === "available" ||
      listing.listingStatus === "pending");

  const banner = listing ? (
    <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-2.5">
      <Link
        href={`/marketplace/listing/${listing._id}`}
        className="group flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
          {photo ? (
            <Image
              src={photo}
              alt={listing.title}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Tag className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold leading-tight">
            {listing.title}
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            {listing.currency} {listing.price.toLocaleString()}
            <span className="ml-2 capitalize text-muted-foreground/70">
              · {listing.listingStatus}
            </span>
          </p>
        </div>
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </Link>

      {canMarkSold && (
        <button
          type="button"
          onClick={() => setConfirmSoldOpen(true)}
          disabled={changeStatus.isPending}
          className="ml-1 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className="size-3.5" />
          Mark as sold
        </button>
      )}
    </div>
  ) : null;

  return (
    <>
      <ChatArea
        conversation={conversation}
        messages={messages}
        meId={me._id}
        loading={msgsLoading}
        sending={sendMutation.isPending}
        themeId={null}
        backHref="/marketplace/messages"
        showCallButtons={false}
        showDetailsToggle={false}
        banner={banner}
        onToggleDetails={() => {}}
        onAudioCall={() => {}}
        onVideoCall={() => {}}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        onSend={async ({ text, files, replyTo }) => {
          const convId = conversation._id;
          if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
              await sendMutation.mutateAsync({
                conversationId: convId,
                file: files[i],
                text: i === 0 ? text : undefined,
                replyTo: i === 0 ? replyTo ?? null : null,
              });
            }
            return;
          }
          if (text) {
            sendMutation.mutate({
              conversationId: convId,
              text,
              replyTo: replyTo ?? null,
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

      <ConfirmDialog
        open={confirmSoldOpen}
        title="Mark this listing as sold?"
        message={
          listing
            ? `"${listing.title}" will be marked as sold to ${buyerName}. Other negotiations on this listing will no longer be able to make offers.`
            : ""
        }
        confirmLabel="Mark as sold"
        loading={changeStatus.isPending}
        onClose={() => {
          if (!changeStatus.isPending) setConfirmSoldOpen(false);
        }}
        onConfirm={() => {
          if (!listing || !buyerCandidate) return;
          changeStatus.mutate(
            {
              listingId: listing._id,
              status: "sold",
              soldTo: buyerCandidate._id,
            },
            {
              onSuccess: (res) => {
                if (res.success) setConfirmSoldOpen(false);
              },
            },
          );
        }}
      />
    </>
  );
}
