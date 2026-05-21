import { auth } from "@/auth";
import DiscussionAbout from "@/components/shared/features/group/discussion/discussion-about";
import { redirect } from "next/navigation";
import AnnouncePostContainer from "../../../../(feed)/view/[username]/announcements/_components/announce-post-container";

const Page = async ({
  params,
}: {
  params: Promise<{ groupUserName: string }>;
}) => {
  const cu = await auth();
  const { groupUserName } = await params;

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return (
    <div className="grid grid-cols-3 gap-5 ">
      <div className=" w-full col-span-2 px-2 sm:px-0 mt-4 pb-8 space-y-4">
        <AnnouncePostContainer
          accessToken={cu.user.accessToken}
          groupId={groupUserName}
          loggedinUser={cu.user.id}
        />
      </div>

      <div className="self-start sticky top-4 h-fit">
        <DiscussionAbout />
      </div>
    </div>
  );
};

export default Page;
