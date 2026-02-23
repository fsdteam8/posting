import type { Metadata } from "next";
import InterestSelectionForm from "./_components/interest-selection-form";

export const metadata: Metadata = {
  title: "Select Your Interests - Onboarding",
  description:
    "Choose your interests to personalize your feed and discover content you'll love.",
};

export default function InterestPage() {
  return <InterestSelectionForm />;
}
