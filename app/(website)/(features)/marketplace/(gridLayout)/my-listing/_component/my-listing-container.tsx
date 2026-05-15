"use client";
import { useGetMarketplaceMeta } from "@/hooks/features/marketplace/api/use-get-marketplace-meta";
import { MarketplaceListing } from "@/types/features/marketplace";
import { useState } from "react";
import { toast } from "sonner";
import { EditListingDialog } from "../../_components/edit-listing-dialog";
import { MyListingsPanel } from "../../_components/my-listings-panel";

interface Props {
  accessToken: string;
}

const MyListingContainer = ({ accessToken }: Props) => {
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const { data } = useGetMarketplaceMeta();

  if (!data?.data) {
    toast.error("Marketplace meta not loaded");
    return;
  }

  return (
    <>
      <MyListingsPanel
        accessToken={accessToken}
        onEdit={(listing) => setListing(listing)}
      />

      <EditListingDialog
        accessToken={accessToken}
        meta={data.data}
        listing={listing}
        open={!!listing}
        onOpenChange={() => setListing(null)}
      />
    </>
  );
};

export default MyListingContainer;
