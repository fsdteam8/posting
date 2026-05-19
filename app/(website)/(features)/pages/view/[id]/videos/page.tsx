import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { VideosClient } from "./_components/videos-client";

interface Props {
  params: Promise<{ id: string }>;
}

const VideosPage = async ({ params }: Props) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const { id } = await params;

  return <VideosClient pageId={id} accessToken={cu.user.accessToken} />;
};

export default VideosPage;
