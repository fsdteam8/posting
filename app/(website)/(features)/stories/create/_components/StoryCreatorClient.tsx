"use client";

import { useCreateStory } from "@/hooks/features/feed/story/use-create-story";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StoryCreatorPreview } from "./StoryCreatorPreview";
import {
  PrivacyType,
  StoryCreatorSidebar,
  StoryFormState,
} from "./StoryCreatorSidebar";

interface Props {
  accessToken: string;
  currentUser: {
    name: string;
    avatar?: string;
  };
}

const DEFAULT_FORM: StoryFormState = {
  text: "",
  backgroundColor: "#1877f2",
  privacy: "public",
  customAudience: [],
  mediaFile: null,
  mediaPreview: null,
  mediaType: null,
  mode: "text",
};

export function StoryCreatorClient({ accessToken, currentUser }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<StoryFormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createStory, isPending } = useCreateStory({ accessToken });

  const handleFormChange = (patch: Partial<StoryFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const handleDiscard = () => {
    router.back();
  };

  const handleShare = () => {
    setError(null);

    const formData = new FormData();

    // text
    if (form.text.trim()) {
      formData.append("text", form.text.trim());
    }

    // backgroundColor
    formData.append("backgroundColor", form.backgroundColor);

    // privacy — map "onlyMe" → "only_me" if your API expects snake_case
    const privacyMap: Record<PrivacyType, string> = {
      public: "public",
      friends: "friends",
      onlyMe: "only_me",
      custom: "custom",
    };
    formData.append("privacy", privacyMap[form.privacy]);

    // customAudience — only relevant when privacy === "custom"
    if (form.privacy === "custom" && form.customAudience.length > 0) {
      form.customAudience.forEach((id) =>
        formData.append("customAudience[]", id),
      );
    }

    // media file
    if (form.mediaFile) {
      formData.append("media", form.mediaFile);
    }

    createStory(formData, {
      onSuccess: () => {
        router.push("/"); // back to feed
      },
      onError: (err) => {
        setError(err.message ?? "Something went wrong. Please try again.");
      },
    });
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] dark:bg-[#18191a] overflow-hidden">
      {/* Sidebar */}
      <StoryCreatorSidebar
        form={form}
        userName={currentUser.name}
        userAvatar={currentUser.avatar}
        isPending={isPending}
        onFormChange={handleFormChange}
        onDiscard={handleDiscard}
        onShare={handleShare}
      />

      {/* Preview */}
      <StoryCreatorPreview
        form={form}
        userName={currentUser.name}
        userAvatar={currentUser.avatar}
      />

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" />
            <path
              d="M8 5v3.5M8 11h.01"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
