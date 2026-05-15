/**
 * /marketplace — SERVER COMPONENT
 *
 * The shell (sidebar + top bar) is rendered by layout.tsx via MarketplaceShell.
 * This page is responsible for exactly two things:
 *   1. Reading the session to get the access token (server-side only).
 *   2. Rendering MarketplaceBrowsePage — the browse content that slots into
 *      the {children} area of MarketplaceShell.
 *
 * No sidebar, no dialogs, no shell chrome here — that would double-render them.
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MarketplaceBrowsePage } from "./_components/marketplace-browse-page";

export default async function MarketplacePage() {
  const cu = await auth();

  // Unauthenticated users go back to the home/login page
  if (!cu?.user?.accessToken) redirect("/");

  return <MarketplaceBrowsePage accessToken={cu.user.accessToken} />;
}
