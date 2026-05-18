"use client";
import { useGetMarketplaceMeta } from "@/hooks/features/marketplace/api/use-get-marketplace-meta";
import { toast } from "sonner";
import { MyListingsPanel } from "../../_components/my-listings-panel";

interface Props {
  accessToken: string;
}

const MyListingContainer = ({ accessToken }: Props) => {
  const { data } = useGetMarketplaceMeta();

  if (!data?.data) {
    toast.error("Marketplace meta not loaded");
    return;
  }

  return (
    <>
      <MyListingsPanel accessToken={accessToken} />
    </>
  );
};

export default MyListingContainer;
