import { auth } from "@/auth";
import { ReelsFeed } from "@/components/features/reels/reels-feed";
import { redirect } from "next/navigation";

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return (
    <ReelsFeed
      accessToken={cu.user.accessToken}
      loggedInUserId={cu.user.id!}
    />
  );
};

export default Page;
