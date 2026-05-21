/**
 * /marketplace/messages layout — SERVER COMPONENT
 *
 * Owns server-side auth and the "me" lookup, then hands off to the
 * MarketplaceMessagesShell which renders the conversation list plus the
 * selected conversation. Mirrors the social messenger's layout structure
 * so the two inboxes feel consistent, while staying completely separate
 * (different route, different data filter, different sidebar).
 */

import { auth } from "@/auth";
import { baseURL } from "@/constants";
import type { MessengerUser } from "@/types/messenger";
import { redirect } from "next/navigation";
import { MarketplaceMessagesShell } from "./_components/marketplace-messages-shell";

export default async function MarketplaceMessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    // Fall back to the session-derived id only.
  }

  return (
    <MarketplaceMessagesShell accessToken={accessToken} me={me}>
      {children}
    </MarketplaceMessagesShell>
  );
}
