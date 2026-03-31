import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StoryViewClient } from "./_components/StoryViewClient";

interface Props {
  params: { storyId: string };
}

const Page = async ({ params }: Props) => {
  const { storyId } = params;

  const session = await auth();
  if (!session?.user?.accessToken) redirect("/login");

  return (
    <StoryViewClient
      accessToken={session.user.accessToken}
      initialStoryId={storyId}
      currentUser={{
        _id: session.user.id ?? "",
        name: session.user.name ?? "You",
        avatar: session.user.image ?? undefined,
      }}
    />
  );
};

export default Page;
