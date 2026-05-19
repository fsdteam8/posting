import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PhotosClient } from "./_components/photos-client";

interface Props {
  params: Promise<{ id: string }>;
}

const PhotosPage = async ({ params }: Props) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const { id } = await params;

  return <PhotosClient pageId={id} accessToken={cu.user.accessToken} />;
};

export default PhotosPage;
