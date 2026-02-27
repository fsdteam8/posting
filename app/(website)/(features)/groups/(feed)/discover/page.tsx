import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DiscoverGroupContainer from "./_components/discover-card-container";

const Page = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  const accessToken = cu.user.accessToken;
  return <DiscoverGroupContainer accessToken={accessToken} />;
};

export default Page;
