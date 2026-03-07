import { auth } from "@/auth";
import { GroupMediaContainer } from "@/components/shared/features/group/media/group-media-container";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { groupUserName: string } }) => {
  const { groupUserName } = await params;
  const cu = await auth();

  if (!cu || !cu.user.accessToken) redirect("/login");

  return (
    <div>
      <GroupMediaContainer
        groupId={groupUserName}
        accessToken={cu.user.accessToken}
      />
    </div>
  );
};

export default Page;
