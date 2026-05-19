import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageDetailsSidebar } from "./_components/page-details-sidebar";
import { PagePhotosSidebar } from "./_components/page-photos-sidebar";
import { PagePostComposer } from "./_components/page-post-composer";
import { PagePostsContainer } from "./_components/page-posts-container";

interface Props {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: Props) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const { id } = await params;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
      {/* Left sidebar */}
      <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
        <PageDetailsSidebar pageId={id} accessToken={cu.user.accessToken} />
        <PagePhotosSidebar pageId={id} accessToken={cu.user.accessToken} />
      </aside>

      {/* Posts feed */}
      <div className="lg:col-span-2">
        <PagePostComposer pageId={id} accessToken={cu.user.accessToken} />
        <PagePostsContainer
          pageId={id}
          accessToken={cu.user.accessToken}
          loggedInUserId={cu.user.id}
        />
      </div>
    </div>
  );
};

export default Page;
