import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PeopleYouMayKnow } from "./_components/people-you-may-know";

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const accessToken = cu.user.accessToken as string;

  return (
    <div className="space-y-8">
      <PeopleYouMayKnow accessToken={accessToken} />
    </div>
  );
};

export default Page;
