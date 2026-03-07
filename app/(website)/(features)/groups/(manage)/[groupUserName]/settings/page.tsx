import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GroupSettingsPage from "./_components/group-settings-page";

const page = async ({ params }: { params: { groupUserName: string } }) => {
  const { groupUserName } = await params;

  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return (
    <div>
      <GroupSettingsPage
        username={groupUserName}
        accessToken={cu.user.accessToken}
      />
    </div>
  );
};

export default page;
