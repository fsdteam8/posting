"use client";
import { MyListingsPanel } from "../../_components/my-listings-panel";

interface Props {
  accessToken: string;
}

const MyListingContainer = ({ accessToken }: Props) => {
  return (
    <>
      <MyListingsPanel accessToken={accessToken} onEdit={() => {}} />
    </>
  );
};

export default MyListingContainer;
