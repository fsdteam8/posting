import { auth } from "@/auth";
import GroupAboutMemberSection from "@/components/shared/features/group/about/group-about-members-section";
import { GroupAboutSection } from "@/components/shared/features/group/about/group-about-section";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { username: string } }) => {
  const cu = await auth();
  const { username } = await params;

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  return (
    <div className="flex flex-col items-center gap-y-5">
      <GroupAboutSection
        username={username}
        accessToken={cu.user.accessToken}
      />

      <GroupAboutMemberSection
        username={username}
        accessToken={cu.user.accessToken}
      />
    </div>
  );
};

export default Page;
