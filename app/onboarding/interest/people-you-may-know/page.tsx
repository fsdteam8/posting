import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PeopleYouMayKnowOnBoradingContainer from "./_components/people-you-may-know-onboarding-container";

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  return (
    <PeopleYouMayKnowOnBoradingContainer accessToken={cu.user.accessToken} />
  );
};

export default Page;
