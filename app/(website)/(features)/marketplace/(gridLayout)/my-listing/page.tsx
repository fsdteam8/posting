import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MyListingContainer from "./_component/my-listing-container";

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/marketplace");
  return (
    <div>
      <MyListingContainer accessToken={cu.user.accessToken} />
    </div>
  );
};

export default Page;
