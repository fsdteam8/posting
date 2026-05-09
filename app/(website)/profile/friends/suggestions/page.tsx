import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SuggestionsSection } from "./_components/suggestions-section";

const SuggestionsPage = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const accessToken = cu.user.accessToken as string;

  return (
    <div className="space-y-8">
      <SuggestionsSection accessToken={accessToken} />
    </div>
  );
};

export default SuggestionsPage;
