import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const OnboardingLayout = async ({ children }: Props) => {
  const cu = await auth();

  // Redirect to login if user is not authenticated
  if (!cu || !cu.user) redirect("/login");

  // Extract onboarding status from user object
  const isOnBoarded = cu.user.isOnboarded;

  // Redirect to home if user already completed onboarding
  if (isOnBoarded) redirect("/");

  // Render onboarding content if user is authenticated but not onboarded
  return <div>{children}</div>;
};

export default OnboardingLayout;
