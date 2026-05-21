/**
 * /marketplace/messages/[conversationId] — server entry point.
 *
 * Pulls the session token + minimal user shape that the chat client needs.
 * The parent layout (MarketplaceMessagesShell) already handles the
 * conversation list and outer chrome.
 */

import { auth } from "@/auth";
import { baseURL } from "@/constants";
import type { MessengerUser } from "@/types/messenger";
import { redirect } from "next/navigation";
import { MarketplaceConversationClient } from "../_components/marketplace-conversation-client";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function MarketplaceConversationPage({ params }: Props) {
  const { conversationId } = await params;

  const session = await auth();
  if (!session?.user?.accessToken) {
    redirect("/login");
  }

  const accessToken = session.user.accessToken;

  let me: MessengerUser = {
    _id: session.user.id,
    firstName: "",
    lastName: "",
  };

  try {
    const res = await fetch(`${baseURL}/users`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const u = json?.data;
      if (u) {
        me = {
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          username: u.username,
          profileImage: u.profileImage,
          isOnline: u.isOnline,
        };
      }
    }
  } catch {
    // Fallback to the session-derived id.
  }

  return (
    <MarketplaceConversationClient
      conversationId={conversationId}
      accessToken={accessToken}
      me={me}
    />
  );
}
