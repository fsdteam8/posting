import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PeopleCard from "./_components/people-card";

const Page = async ({ params }: { params: { username: string } }) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const { username } = await params;
  return (
    <div>
      <PeopleCard accessToken={cu.user.accessToken} groupUserName={username} />
    </div>
  );
};

export default Page;
