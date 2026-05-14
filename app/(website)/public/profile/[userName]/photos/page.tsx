import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: { userName: string };
}

const PublicProfilePhotosPage = async ({ params }: PageProps) => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-gray-400">Photos for {params.userName}.</p>
    </div>
  );
};

export default PublicProfilePhotosPage;
