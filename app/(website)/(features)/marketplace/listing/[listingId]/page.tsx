/**
 * /marketplace/listing/[listingId] — SERVER COMPONENT
 *
 * Reads the session token server-side and passes it down to the
 * interactive client component. No data fetching here — the client
 * component owns that via useGetListing() so it can handle loading
 * and error states gracefully with skeleton UI.
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ListingDetailClient } from "./_components/listing-detail-client";

type PageProps = {
  params: Promise<{ listingId: string }>;
};

export default async function ListingDetailPage({ params }: PageProps) {
  const cu = await auth();

  if (!cu?.user?.accessToken) redirect("/");
  const { listingId } = await params;

  return (
    <ListingDetailClient
      listingId={listingId}
      accessToken={cu.user.accessToken}
      currentUserId={cu.user.id ?? ""}
    />
  );
}
