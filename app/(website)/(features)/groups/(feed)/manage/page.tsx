import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ManagedGroupContainer from "./_components/managed-group-container";

const Page = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  const accessToken = cu.user.accessToken;
  return <ManagedGroupContainer accessToken={accessToken} />;
};

export default Page;
