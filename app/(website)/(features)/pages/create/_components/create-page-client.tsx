"use client";

import { useCreatePage } from "@/hooks/features/pages/use-create-page";
import { useUpdatePage } from "@/hooks/features/pages/use-update-page";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepCategory } from "./step-category";
import { StepDetails } from "./step-details";
import { StepInvite } from "./step-invite";
import { StepName } from "./step-name";
import { StepNotifications } from "./step-notification";
import { StepPhotos } from "./step-photos";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type NotificationPrefs = {
  marketingEmails: boolean;
  pageNotifications: boolean;
};

const INITIAL_FORM: PageFormData = {
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

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Name" },
  { label: "Category" },
  { label: "Details" },
  { label: "Photos" },
  { label: "Invite" },
  { label: "Notifications" },
];

const TOTAL_STEPS = STEPS.length;

// ─── Component ────────────────────────────────────────────────────────────────

interface CreatePageClientProps {
  accessToken: string;
}

export function CreatePageClient({ accessToken }: CreatePageClientProps) {
  const router = useRouter();

  // Stepper state
  const [step, setStep] = useState(1);

  // Created page id — set after step 3 API call, used by subsequent steps
  const [createdPageId, setCreatedPageId] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<PageFormData>(INITIAL_FORM);

  // Photo files + previews
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Invite selections
  const [inviteSelected, setInviteSelected] = useState<Set<string>>(new Set());

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    marketingEmails: true,
    pageNotifications: false,
  });

  // Mutations
  const { mutate: createPage, isPending: isCreating } = useCreatePage({
    accessToken,
  });
  const { mutate: updatePage, isPending: isUpdating } = useUpdatePage({
    accessToken,
    pageId: createdPageId ?? "",
  });

  const isPending = isCreating || isUpdating;

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function handleField(field: keyof PageFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleProfileChange(file: File) {
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  }

  function handleCoverChange(file: File) {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function handleInviteToggle(id: string) {
    setInviteSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function handleNotifToggle(key: keyof NotificationPrefs) {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function canAdvance() {
    if (step === 1) return formData.name.trim().length > 0;
    return true;
  }

  function handleBack() {
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  }

  // ─── Step submit logic ──────────────────────────────────────────────────────

  function handleNext() {
    // Step 3: create the page via API
    if (step === 3) {
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
              setCreatedPageId(res.data._id);
              setStep(4);
            }
          },
        },
      );
      return;
    }

    // Step 4: upload profile and cover photos if selected
    if (step === 4) {
      if ((profileFile || coverFile) && createdPageId) {
        updatePage(
          {
            profileImage: profileFile ?? undefined,
            coverImage: coverFile ?? undefined,
          },
          {
            onSuccess: () => setStep(5),
          },
        );
      } else {
        setStep(5);
      }
      return;
    }

    // Step 5: invite friends — fire and forget, no blocking API yet
    if (step === 5) {
      // TODO: call invite API with Array.from(inviteSelected) when endpoint is available
      setStep(6);
      return;
    }

    // Step 6: done — navigate to the new page
    if (step === 6) {
      if (createdPageId) {
        router.push(`/pages/${createdPageId}`);
      } else {
        router.push("/pages");
      }
      return;
    }

    // Steps 1 & 2: just advance
    setStep((s) => s + 1);
  }

  // ─── Button label ────────────────────────────────────────────────────────────

  function ctaLabel() {
    if (isPending) return null;
    if (step === 3) return "Create Page";
    if (step === 4)
      return profileFile || coverFile ? "Save & Continue" : "Skip";
    if (step === 5)
      return inviteSelected.size > 0
        ? `Invite ${inviteSelected.size} friend${inviteSelected.size > 1 ? "s" : ""}`
        : "Skip";
    if (step === 6) return "Done";
    return "Next";
  }

  const stepLabel = `Step ${step} of ${TOTAL_STEPS} — ${STEPS[step - 1].label}`;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-145">
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

        {/* Step content */}
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
          {step === 4 && (
            <StepPhotos
              profilePreview={profilePreview}
              coverPreview={coverPreview}
              onProfileChange={handleProfileChange}
              onCoverChange={handleCoverChange}
            />
          )}
          {step === 5 && (
            <StepInvite
              selected={inviteSelected}
              onToggle={handleInviteToggle}
              accessToken={accessToken}
            />
          )}
          {step === 6 && (
            <StepNotifications
              pageName={formData.name}
              prefs={notifPrefs}
              onToggle={handleNotifToggle}
            />
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleNext}
            disabled={!canAdvance() || isPending}
            className="w-full py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {step === 3 ? "Creating..." : "Saving..."}
              </>
            ) : (
              ctaLabel()
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
