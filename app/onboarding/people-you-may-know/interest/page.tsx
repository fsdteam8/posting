import { auth } from "@/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import InterestSelectionForm from "./_components/interest-selection-form";

export const metadata: Metadata = {
  title: "Select Your Interests - Onboarding",
  description:
    "Choose your interests to personalize your feed and discover content you'll love.",
};

export default async function InterestPage() {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  return <InterestSelectionForm accessToken={cu.user.accessToken} />;
}
