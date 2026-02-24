import type { Metadata } from "next";
import OnboardingCard from "./_components/on-boarding-card";
import OnboardingProgress from "./interest/_components/on-boarding-progress";

export const metadata: Metadata = {
  title: "Upload Profile Photo - Onboarding",
  description: "Upload your profile photo to complete your account setup.",
};

export default function OnboardingPage() {
  return (
    <main className="flex min-h-svh flex-col bg-muted/40">
      <header className="flex items-center justify-center px-6 py-4">
        <OnboardingProgress currentStep={1} totalSteps={3} />
      </header>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <OnboardingCard />
          <p className="text-center text-xs text-muted-foreground">
            You can always change your profile picture later in your account
            settings.
          </p>
        </div>
      </div>
    </main>
  );
}
