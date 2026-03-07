import { auth } from "@/auth";
import DiscussionAbout from "@/components/shared/features/group/discussion/discussion-about";
import RecentMedia from "@/components/shared/features/group/media/recent-media";
import { redirect } from "next/navigation";
import AnnouncePostContainer from "./_components/announce-post-container";

const Page = async ({ params }: { params: { username: string } }) => {
  const cu = await auth();
  const { username } = await params;

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return (
    <div className="grid grid-cols-3 gap-5 ">
      <div className=" w-full col-span-2 px-2 sm:px-0 mt-4 pb-8 space-y-4">
        <AnnouncePostContainer
          accessToken={cu.user.accessToken}
          groupId={username}
          loggedinUser={cu.user.id}
        />
      </div>

      <div className="self-start sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto space-y-5 scrollbar-hide">
        <DiscussionAbout />

        <RecentMedia
          groupId={username}
          accessToken={cu.user.accessToken}
          username={username}
        />
      </div>
    </div>
  );
};

export default Page;
