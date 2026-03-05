import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PeopleCard from "../../../../(feed)/view/[username]/members/_components/people-card";

const Page = async ({ params }: { params: { groupUserName: string } }) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const { groupUserName } = await params;
  return (
    <div>
      <PeopleCard
        accessToken={cu.user.accessToken}
        groupUserName={groupUserName}
      />
    </div>
  );
};

export default Page;
