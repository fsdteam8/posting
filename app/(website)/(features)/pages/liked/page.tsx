import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LikedView } from "./_components/liked-view";

const LikedPage = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return <LikedView accessToken={cu.user.accessToken} />;
};

export default LikedPage;
