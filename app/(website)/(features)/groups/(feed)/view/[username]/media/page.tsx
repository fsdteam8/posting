import { auth } from "@/auth";
import { GroupMediaContainer } from "@/components/shared/features/group/media/group-media-container";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { username: string } }) => {
  const { username } = await params;
  const cu = await auth();

  if (!cu || !cu.user.accessToken) redirect("/login");

  return (
    <div>
      <GroupMediaContainer
        groupId={username}
        accessToken={cu.user.accessToken}
      />
    </div>
  );
};

export default Page;
