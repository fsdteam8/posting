"use client";

import { cn } from "@/lib/utils";
import { Moon } from "lucide-react";
import { useTheme } from "next-themes";

type ThemeOption = "light" | "dark" | "system";

interface DisplayAccessibilityProps {
  onBack: () => void;
}

const options: {
  value: ThemeOption;
  label: string;
  description?: string;
}[] = [
  { value: "light", label: "Off" },
  { value: "dark", label: "On" },
  {
    value: "system",
    label: "Automatic",
    description:
      "We'll automatically adjust the display based on your device's system settings.",
  },
];

export function DisplayAccessibility({ onBack }: DisplayAccessibilityProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center justify-center size-8 rounded-full hover:bg-secondary transition-colors text-foreground"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="text-[17px] font-bold text-foreground">
          Display &amp; accessibility
        </h2>
      </div>

      {/* Dark Mode Section */}
      <div className="px-4 py-4">
        {/* Section header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
            <Moon className="size-5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-foreground leading-tight">
              Dark mode
            </p>
            <p className="text-[13px] text-muted-foreground leading-snug">
              Adjust the appearance to reduce glare and give your eyes a break.
            </p>
          </div>
        </div>

        {/* Radio options */}
        <div className="flex flex-col gap-0.5 pl-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[15px] font-medium text-foreground">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-[13px] text-muted-foreground leading-snug">
                    {option.description}
                  </span>
                )}
              </div>
              {/* Radio button */}
              <div
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  theme === option.value
                    ? "border-primary"
                    : "border-muted-foreground/40",
                )}
              >
                {theme === option.value && (
                  <div className="size-2.5 rounded-full bg-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
