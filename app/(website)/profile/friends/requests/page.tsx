import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FriendRequestsSection } from "./_components/friend-requests-section";

const FriendRequestsPage = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const accessToken = cu.user.accessToken as string;

  return (
    <div className="space-y-8">
      <FriendRequestsSection accessToken={accessToken} />
    </div>
  );
};

export default FriendRequestsPage;
