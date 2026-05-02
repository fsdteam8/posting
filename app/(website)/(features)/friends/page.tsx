import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FriendsSidebar } from "./_components/friends-sidebar";
import { PeopleYouMayKnow } from "./_components/people-you-may-know";

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const accessToken = cu.user.accessToken as string;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto flex gap-4 px-4 py-6">
        {/* Sidebar */}
        <FriendsSidebar />

        {/* Main content */}
        <main className="flex-1 space-y-8 min-w-0">
          <PeopleYouMayKnow accessToken={accessToken} />
        </main>
      </div>
    </div>
  );
};

export default Page;
