import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreteGroupContainer from "./_components/create-group-container";

const page = async () => {
  const cu = await auth();

  // is not loggedin then redirect to the sign in page for authenticate
  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  return (
    <>
      <CreteGroupContainer accessToken={cu.user.accessToken} />
    </>
  );
};

export default page;
