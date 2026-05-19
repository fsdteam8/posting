import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DiscoverView from "./_components/views/discover-view";

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return <DiscoverView accessToken={cu.user.accessToken} />;
};

export default Page;
