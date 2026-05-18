import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EditListingPage from "./_components/edit-listing-page";

type Props = {
  params: Promise<{ listingId: string }>;
};

export default async function Page({ params }: Props) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/");

  const resolvedParams = await params;
  
  if (!resolvedParams.listingId) redirect("/marketplace/my-listing");

  return (
    <EditListingPage
      listingId={resolvedParams.listingId}
      accessToken={cu.user.accessToken}
    />
  );
}
