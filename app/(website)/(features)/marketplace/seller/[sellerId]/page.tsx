/**
 * /marketplace/seller/[sellerId] — SERVER COMPONENT
 *
 * Reads the session token server-side and passes it down to the
 * interactive client component. Mirrors the pattern used by the
 * listing detail page.
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SellerDetailClient } from "./_components/seller-detail-client";

type PageProps = {
  params: Promise<{ sellerId: string }>;
};

export default async function SellerDetailPage({ params }: PageProps) {
  const cu = await auth();

  if (!cu?.user?.accessToken) redirect("/");
  const { sellerId } = await params;

  return (
    <SellerDetailClient
      sellerId={sellerId}
      accessToken={cu.user.accessToken}
      currentUserId={cu.user.id ?? ""}
    />
  );
}
