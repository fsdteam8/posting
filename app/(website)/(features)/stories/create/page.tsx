import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StoryCreatorClient } from "./_components/StoryCreatorClient";

const Page = async () => {
  const session = await auth();

  if (!session?.user?.accessToken) redirect("/login");

  return (
    <StoryCreatorClient
      accessToken={session.user.accessToken}
      currentUser={{
        name: session.user.name ?? "You",
        avatar: session.user.image ?? undefined,
      }}
    />
  );
};

export default Page;
