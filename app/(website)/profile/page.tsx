import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfilePageClient } from "./_components/profile-page-client";

const ProfilePage = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.accessToken) redirect("/");

  return (
    <ProfilePageClient accessToken={cu.user.accessToken} userId={cu.user.id!} />
  );
};

export default ProfilePage;
