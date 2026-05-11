import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateListingPage from "./_components/create-listing-page";

export default async function Page() {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/");

  return <CreateListingPage accessToken={cu.user.accessToken} />;
}
