"use client";

import { useCreatePage } from "@/hooks/features/pages/use-create-page";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepCategory } from "./step-category";
import { StepDetails } from "./step-details";
import { StepName } from "./step-name";

export type PageFormData = {
  name: string;
  category: string;
  bio: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  hoursStatus: string;
};

const INITIAL: PageFormData = {
  name: "",
  category: "",
  bio: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postcode: "",
  hoursStatus: "No hours available",
};

const TOTAL_STEPS = 3;

interface CreatePageClientProps {
  accessToken: string;
}

export function CreatePageClient({ accessToken }: CreatePageClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PageFormData>(INITIAL);

  const { mutate: createPage, isPending } = useCreatePage({ accessToken });

  function handleField(field: keyof PageFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance() {
    if (step === 1) return formData.name.trim().length > 0;
    if (step === 2) return true; // category is optional
    return true;
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    // Final step — submit
    createPage(
      {
        name: formData.name,
        category: formData.category,
        description: formData.bio,
        bio: formData.bio,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        location: JSON.stringify({
          address: formData.address,
          city: formData.city,
          postcode: formData.postcode,
        }),
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data?._id) {
            router.push(`/pages/${res.data._id}`);
          }
        },
      },
    );
  }

  function handleBack() {
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  }

  const stepLabel =
    step === 1
      ? "Step 1 of 3 — Name"
      : step === 2
        ? "Step 2 of 3 — Category"
        : "Step 3 of 3 — Details";

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 pb-6 sm:py-5">
      <div className="w-full  bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-145">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
          <button
            onClick={handleBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">
              Create your Page
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{stepLabel}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step content — scrollable on mobile */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {step === 1 && (
            <StepName
              value={formData.name}
              onChange={(v) => handleField("name", v)}
            />
          )}
          {step === 2 && (
            <StepCategory
              pageName={formData.name}
              value={formData.category}
              onChange={(v) => handleField("category", v)}
            />
          )}
          {step === 3 && (
            <StepDetails
              pageName={formData.name}
              category={formData.category}
              formData={formData}
              onChange={handleField}
            />
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleNext}
            disabled={!canAdvance() || isPending}
            className="w-full py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : step === TOTAL_STEPS ? (
              "Create Page"
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
