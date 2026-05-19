import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { InvitationsView } from "./_components/invitation-view";

const InvitationsPage = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return <InvitationsView accessToken={cu.user.accessToken} />;
};

export default InvitationsPage;
