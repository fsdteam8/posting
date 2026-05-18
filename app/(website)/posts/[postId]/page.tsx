import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PostDetailClient } from "./_components/PostDetailClient";

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

// ─── Page metadata (optional — good for SEO on shared links) ─────────────────
export async function generateMetadata({ params }: PostDetailPageProps) {
  const { postId } = await params;
  return {
    title: "Post | Postin",
    description: "View this post on Postin",
    openGraph: {
      title: "Post | Postin",
      url: `/posts/${postId}`,
    },
  };
}

// ─── Server component — auth guard lives here ─────────────────────────────────

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const { postId } = await params;

  return (
    // Matches the same bg and layout padding as HomeLayout
    <div className="flex justify-center bg-[#F2F3F5] min-h-screen">
      <div className="w-full max-w-170 px-0 sm:px-4">
        <PostDetailClient
          postId={postId}
          accessToken={cu.user.accessToken}
          loggedInUserId={cu.user.id!}
        />
      </div>
    </div>
  );
}
