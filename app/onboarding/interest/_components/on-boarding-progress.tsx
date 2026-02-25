"use client";

import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export default function OnboardingProgress({
  currentStep,
  totalSteps = 3,
}: OnboardingProgressProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 w-8 rounded-full transition-colors",
            i < currentStep ? "bg-primary" : "bg-muted-foreground/20",
          )}
        />
      ))}
    </div>
  );
}
