import { auth } from "@/auth";
import DiscussionAbout from "@/components/shared/features/group/discussion/discussion-about";
import GroupFeaturedSection from "@/components/shared/features/group/discussion/group-featured-section";
import GroupPostCard from "@/components/shared/features/group/discussion/group-post-card";
import PostModalContainer from "@/components/shared/features/post-modal/post-modal-container";
import { ChevronDown } from "lucide-react";
import { redirect } from "next/navigation";

const POSTS = [
  {
    id: 1,
    authorName: "Muhabbat Ka Misale",
    authorBadge: "All-star contributor",
    timestamp: "February 25 at 3:09 PM",
    content: "Sorry, a mistake has been made \u{1F605}\u{1F605}",
    hasMedia: true,
    mediaType: "video" as const,
    reactions: {
      count: 804,
      types: ["haha" as const, "like" as const],
    },
    comments: 9,
    shares: 11,
    commentsList: [
      {
        id: 1,
        name: "Adibur Rahman",
        text: "kisu hobe nah\nakhon sry bollei hobe",
        time: "10m",
      },
      {
        id: 2,
        name: "Rs Shahparan Sordar Rasel",
        text: "Ramadan is truly a great blessing to forget and forgive",
        time: "8m",
        hasFollow: true,
      },
    ],
  },
  {
    id: 2,
    authorName: "Nusrat Jahan",
    authorBadge: "Rising star",
    timestamp: "February 25 at 1:45 PM",
    content: "Alhamdulillah for everything. Remember to smile, it is sunnah!",
    hasMedia: true,
    mediaType: "image" as const,
    reactions: {
      count: 1243,
      types: ["love" as const, "like" as const, "haha" as const],
    },
    comments: 23,
    shares: 45,
    commentsList: [
      {
        id: 1,
        name: "Farhan Ahmed",
        text: "MashaAllah, beautiful reminder!",
        time: "22m",
      },
    ],
  },
];

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

        {POSTS.map((post) => (
          <GroupPostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="self-start sticky top-4 h-fit">
        <DiscussionAbout />
      </div>
    </div>
  );
};

export default Page;
