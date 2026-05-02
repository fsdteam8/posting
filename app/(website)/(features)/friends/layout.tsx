import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  FriendsMobileNav,
  FriendsSidebar,
} from "./_components/friends-sidebar";

type FriendsLayoutProps = {
  children: React.ReactNode;
};

const FriendsLayout = async ({ children }: FriendsLayoutProps) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile sticky nav — full width, outside the flex row */}
      <FriendsMobileNav />

      {/* Page body */}
      <div className="max-w-7xl w-full mx-auto flex gap-4 px-4 py-6">
        {/* Desktop sidebar — persists across all /friends/* routes */}
        <FriendsSidebar />

        {/* Each sub-page renders here */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default FriendsLayout;
