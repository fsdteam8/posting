import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EditProfileClient } from "./_components/edit-profile-client";

const EditProfilePage = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.accessToken) redirect("/");

  return <EditProfileClient accessToken={cu.user.accessToken} />;
};

export default EditProfilePage;
