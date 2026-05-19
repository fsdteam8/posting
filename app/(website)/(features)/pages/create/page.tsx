import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreatePageClient } from "./_components/create-page-client";

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return <CreatePageClient accessToken={cu.user.accessToken} />;
};

export default Page;
