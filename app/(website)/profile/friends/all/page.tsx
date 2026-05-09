import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AllFriendsSection } from "./_components/all-friends-section";

const AllFriendsPage = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const accessToken = cu.user.accessToken as string;

  return (
    <div className="space-y-8">
      <AllFriendsSection accessToken={accessToken} />
    </div>
  );
};

export default AllFriendsPage;
