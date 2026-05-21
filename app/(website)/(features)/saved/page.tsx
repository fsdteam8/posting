import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SavedPageShell } from "./_components/saved-page-shell";

export const metadata = {
  title: "Saved",
  description: "Posts and items you have saved",
};

const Page = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return <SavedPageShell accessToken={cu.user.accessToken} />;
};

export default Page;
