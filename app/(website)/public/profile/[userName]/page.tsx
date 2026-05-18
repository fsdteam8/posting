import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PublicProfilePageClient from "./_components/public-profile-page-client";

interface PageProps {
  params: { userName: string };
}

const PublicProfilePage = async ({ params }: PageProps) => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.id) redirect("/login");
  const { userName } = await params;

  return (
    <PublicProfilePageClient
      username={userName}
      accessToken={cu.user.accessToken!}
      loggedInUserId={cu.user.id}
    />
  );
};

export default PublicProfilePage;
