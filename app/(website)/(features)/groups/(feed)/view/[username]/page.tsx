import { auth } from "@/auth";
import DiscussionAbout from "@/components/shared/features/group/discussion/discussion-about";
import GroupFeaturedSection from "@/components/shared/features/group/discussion/group-featured-section";
import PostModalContainer from "@/components/shared/features/post-modal/post-modal-container";
import { ChevronDown } from "lucide-react";
import { redirect } from "next/navigation";
import GroupPostContainer from "./_components/group-posts-container";

const Page = async ({ params }: { params: { username: string } }) => {
  const cu = await auth();
  const { username } = await params;

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return (
    <div className="grid grid-cols-3 gap-5 ">
      <div className=" w-full col-span-2 px-2 sm:px-0 mt-4 pb-8 space-y-4">
        <PostModalContainer
          accessToken={cu?.user.accessToken}
          username={username}
          app="group"
        />

        <GroupFeaturedSection />

        <div className="px-4 py-2">
          <button className="flex items-center gap-1 text-[15px] font-semibold text-fb-blue hover:underline">
            Most relevant
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <GroupPostContainer
          accessToken={cu.user.accessToken}
          groupId={username}
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
