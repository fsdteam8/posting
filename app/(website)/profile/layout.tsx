import { auth } from "@/auth";
import { ProfileLayoutClient } from "@/components/profile/profile-layout-client";
import { redirect } from "next/navigation";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout = async ({ children }: ProfileLayoutProps) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/");

  const accessToken = cu.user.accessToken;

  return (
    <ProfileLayoutClient accessToken={accessToken}>
      {children}
    </ProfileLayoutClient>
  );
};

export default ProfileLayout;
