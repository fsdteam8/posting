import { auth } from "@/auth";
import { PublicProfileLayoutClient } from "@/components/profile/public-profile-layout-client";
import { redirect } from "next/navigation";

interface PublicProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ userName: string }>;
}

const PublicProfileLayout = async ({
  children,
  params,
}: PublicProfileLayoutProps) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  const { userName } = await params;

  return (
    <PublicProfileLayoutClient
      username={userName}
      accessToken={cu.user.accessToken!}
      loggedInUserId={cu.user.id}
    >
      {children}
    </PublicProfileLayoutClient>
  );
};

export default PublicProfileLayout;
