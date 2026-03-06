import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GroupRulesContainer from "./_components/group-rules-container";

const Page = async ({ params }: { params: { groupUserName: string } }) => {
  const { groupUserName } = await params;

  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  return (
    <div>
      <GroupRulesContainer cu={cu.user} groupUserName={groupUserName} />
    </div>
  );
};

export default Page;
