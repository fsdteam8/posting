import { auth } from "@/auth";
import { redirect } from "next/navigation";

const ProfileAboutPage = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.accessToken) redirect("/");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-gray-400">About section will appear here.</p>
    </div>
  );
};

export default ProfileAboutPage;
