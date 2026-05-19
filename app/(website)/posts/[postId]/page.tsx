import { auth } from "@/auth";
import { baseURL } from "@/constants";
import { redirect } from "next/navigation";
import { PostDetailClient } from "./_components/PostDetailClient";

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

// ─── Dynamic metadata derived from the post itself ────────────────────────────
export async function generateMetadata({ params }: PostDetailPageProps) {
  const { postId } = await params;
  const cu = await auth();

  const fallback = {
    title: "Post | Postin",
    description: "View this post on Postin",
    openGraph: {
      title: "Post | Postin",
      url: `/posts/${postId}`,
    },
  };

  if (!cu?.user?.accessToken) return fallback;

  try {
    const res = await fetch(`${baseURL}/posts/${postId}`, {
      headers: { Authorization: `Bearer ${cu.user.accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    const json = await res.json();
    const post = json?.data;
    if (!post) return fallback;

    const author = post.author;
    const authorName =
      author && `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim();
    const plain =
      typeof post.content === "string"
        ? post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
        : "";
    const description =
      plain.slice(0, 160) || `View ${authorName ?? "this"} post on Postin`;
    const title = `${authorName ?? "Post"} on Postin`;
    const firstImage = post.images?.[0]?.url ?? post.videos?.[0]?.thumbnail;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/posts/${postId}`,
        images: firstImage ? [firstImage] : undefined,
      },
      twitter: {
        card: firstImage ? "summary_large_image" : "summary",
        title,
        description,
      },
    };
  } catch {
    return fallback;
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const { postId } = await params;

  return (
    <div className="bg-muted min-h-screen">
      <div className="w-full max-w-5xl mx-auto">
        <PostDetailClient
          postId={postId}
          accessToken={cu.user.accessToken}
          loggedInUserId={cu.user.id!}
        />
      </div>
    </div>
  );
}
