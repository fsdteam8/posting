import { auth } from "@/auth";
import { redirect } from "next/navigation";
import JoinedGroupContainer from "./_components/joined-group-container";

const Page = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  const accessToken = cu.user.accessToken;

  return <JoinedGroupContainer accessToken={accessToken} />;
};

export default Page;
