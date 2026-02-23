import type { Metadata } from "next";
import OnboardingCard from "./_components/on-boarding-card";

export const metadata: Metadata = {
  title: "Upload Profile Photo - Onboarding",
  description: "Upload your profile photo to complete your account setup.",
};

export default function OnboardingPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <OnboardingCard />
        <p className="text-center text-xs text-muted-foreground">
          You can always change your profile picture later in your account
          settings.
        </p>
      </div>
    </main>
  );
}
