import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AboutClient } from "./_components/about-client";

interface Props {
  params: Promise<{ id: string }>;
}

const AboutPage = async ({ params }: Props) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const { id } = await params;

  return <AboutClient pageId={id} accessToken={cu.user.accessToken} />;
};

export default AboutPage;
