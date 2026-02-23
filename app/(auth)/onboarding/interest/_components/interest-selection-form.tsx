"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { InterestChip } from "./interest-chip";
import OnboardingProgress from "./on-boarding-progress";

const INTERESTS = [
  { emoji: "🐾", label: "Animals" },
  { emoji: "🎵", label: "Music" },
  { emoji: "⚽", label: "Sports" },
  { emoji: "🏕️", label: "Outdoor activities" },
  { emoji: "💃", label: "Dancing" },
  { emoji: "🥗", label: "Healthy life" },
  { emoji: "💪", label: "Gym & Fitness" },
  { emoji: "📰", label: "Politics" },
  { emoji: "📺", label: "TV & News" },
  { emoji: "🐴", label: "Horseback Riding" },
  { emoji: "💇", label: "Beauty Salons" },
  { emoji: "💻", label: "Programming and Development" },
  { emoji: "🎨", label: "Crafts" },
  { emoji: "🗺️", label: "Journeys" },
  { emoji: "🏊", label: "Swimming" },
  { emoji: "⚽", label: "Football" },
  { emoji: "🏔️", label: "Mountaineering" },
  { emoji: "🛍️", label: "Shopping" },
  { emoji: "👗", label: "Fashion" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🎨", label: "Art" },
  { emoji: "✏️", label: "Writing" },
  { emoji: "🏛️", label: "Architecture" },
  { emoji: "🍔", label: "Food" },
  { emoji: "🌱", label: "Planting" },
  { emoji: "🎬", label: "Movie" },
  { emoji: "🔬", label: "Science" },
  { emoji: "⛺", label: "Camping" },
  { emoji: "📜", label: "History" },
  { emoji: "🎨", label: "Design" },
  { emoji: "📷", label: "Photography" },
  { emoji: "🧘", label: "Yoga" },
  { emoji: "📚", label: "Book" },
  { emoji: "🍳", label: "Cooking" },
] as const;

const interestFormSchema = z.object({
  interests: z
    .array(z.string())
    .min(5, "Please select at least 5 interests to continue."),
});

type InterestFormValues = z.infer<typeof interestFormSchema>;

export default function InterestSelectionForm() {
  const form = useForm<InterestFormValues>({
    resolver: zodResolver(interestFormSchema),
    defaultValues: {
      interests: [],
    },
    mode: "onChange",
  });

  const selectedInterests = useWatch({
    name: "interests",
    control: form.control,
  });

  const toggleInterest = useCallback(
    (label: string) => {
      const current = form.getValues("interests");
      const next = current.includes(label)
        ? current.filter((i) => i !== label)
        : [...current, label];
      form.setValue("interests", next, { shouldValidate: true });
    },
    [form],
  );

  function onSubmit(data: InterestFormValues) {
    // Handle form submission
    console.log("Selected interests:", data.interests);
  }

  const hasMinimum = selectedInterests.length >= 5;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <OnboardingProgress currentStep={1} totalSteps={3} />

        {/* Spacer for centering the progress bar */}
        <div className="w-13" />
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center px-6 pt-8 pb-6">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          {/* Heading */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance text-center sm:text-3xl">
              Select Your interests
            </h1>
            <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground">
              {
                "Choose 5 or more interests to personalize your feed and discover content you'll love."
              }
            </p>
          </div>

          {/* Interest chips form */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col items-center gap-8"
          >
            <div className="flex flex-wrap justify-center gap-2.5">
              {INTERESTS.map((interest) => (
                <InterestChip
                  key={interest.label}
                  emoji={interest.emoji}
                  label={interest.label}
                  selected={selectedInterests.includes(interest.label)}
                  onToggle={() => toggleInterest(interest.label)}
                />
              ))}
            </div>

            {/* Validation message */}
            {form.formState.errors.interests && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.interests.message}
              </p>
            )}

            {/* Selected count indicator */}
            <p className="text-xs text-muted-foreground">
              {selectedInterests.length} of 5 minimum selected
            </p>
          </form>
        </div>
      </main>

      {/* Bottom action bar */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3 px-6 py-5">
          <Button variant="outline" className="min-w-35 rounded-full" asChild>
            <Link href="/onboarding">Skip for now</Link>
          </Button>
          <Button
            className="min-w-35 rounded-full"
            disabled={!hasMinimum}
            onClick={form.handleSubmit(onSubmit)}
          >
            Continue
          </Button>
        </div>
      </footer>
    </div>
  );
}
