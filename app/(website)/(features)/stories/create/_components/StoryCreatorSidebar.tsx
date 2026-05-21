"use client";

import {
  Globe,
  Image as ImageIcon,
  Lock,
  Type,
  UserCheck,
  Users,
  Video as VideoIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

export type PrivacyType = "public" | "friends" | "onlyMe" | "custom";

export type MediaType = "image" | "video";

export interface StoryFormState {
  text: string;
  backgroundColor: string;
  privacy: PrivacyType;
  customAudience: string[];
  mediaFile: File | null;
  mediaPreview: string | null;
  mediaType: MediaType | null;
  mode: "text" | "photo";
}

const BACKGROUND_COLORS = [
  // gradients stored as CSS gradient strings, value stored as hex for API
  { css: "linear-gradient(135deg,#f97316,#ec4899)", hex: "#f97316" },
  { css: "linear-gradient(135deg,#7c3aed,#ec4899)", hex: "#7c3aed" },
  { css: "linear-gradient(135deg,#06b6d4,#3b82f6)", hex: "#06b6d4" },
  { css: "linear-gradient(135deg,#10b981,#06b6d4)", hex: "#10b981" },
  { css: "linear-gradient(135deg,#1d4ed8,#7c3aed)", hex: "#1d4ed8" },
  { css: "linear-gradient(135deg,#f59e0b,#ef4444)", hex: "#f59e0b" },
  { css: "linear-gradient(135deg,#ec4899,#f43f5e)", hex: "#ec4899" },
  { css: "linear-gradient(135deg,#84cc16,#10b981)", hex: "#84cc16" },
  { css: "linear-gradient(135deg,#f43f5e,#f97316)", hex: "#f43f5e" },
  { css: "linear-gradient(135deg,#8b5cf6,#06b6d4)", hex: "#8b5cf6" },
  { css: "linear-gradient(135deg,#0ea5e9,#6366f1)", hex: "#0ea5e9" },
  { css: "linear-gradient(135deg,#d97706,#dc2626)", hex: "#d97706" },
  // solid colors
  { css: "#1877f2", hex: "#1877f2" },
  { css: "#3b5998", hex: "#3b5998" },
  { css: "#111827", hex: "#111827" },
  { css: "#ffffff", hex: "#ffffff" },
];

const PRIVACY_OPTIONS: {
  value: PrivacyType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "public", label: "Public", icon: <Globe size={14} /> },
  { value: "friends", label: "Friends", icon: <Users size={14} /> },
  { value: "onlyMe", label: "Only Me", icon: <Lock size={14} /> },
  { value: "custom", label: "Custom", icon: <UserCheck size={14} /> },
];

interface Props {
  form: StoryFormState;
  userName: string;
  userAvatar?: string;
  isPending: boolean;
  onFormChange: (patch: Partial<StoryFormState>) => void;
  onDiscard: () => void;
  onShare: () => void;
}

export function StoryCreatorSidebar({
  form,
  userName,
  userAvatar,
  isPending,
  onFormChange,
  onDiscard,
  onShare,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    const mediaType: MediaType = file.type.startsWith("video/")
      ? "video"
      : "image";
    onFormChange({
      mediaFile: file,
      mediaPreview: preview,
      mediaType,
      mode: "photo",
    });
  };

  const canShare =
    form.mode === "text" ? form.text.trim().length > 0 : !!form.mediaFile;

  return (
    <aside className="w-85 min-w-75 h-full bg-white dark:bg-[#242526] flex flex-col shadow-xl z-10">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-[#e4e6eb] dark:border-[#3a3b3c]">
        <h1 className="text-[22px] font-bold text-[#050505] dark:text-white tracking-tight">
          Stories
        </h1>
        <div className="flex gap-3 mt-0.5">
          <button className="text-[13px] text-[#1877f2] font-medium hover:underline">
            Archive
          </button>
          <span className="text-[#65676b]">·</span>
          <button className="text-[13px] text-[#1877f2] font-medium hover:underline">
            Settings
          </button>
        </div>
      </div>

      {/* Your Story */}
      <div className="px-4 pt-4">
        <p className="text-[15px] font-semibold text-[#050505] dark:text-white mb-3">
          Your Story
        </p>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e4e6eb] shrink-0">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#050505] dark:text-white leading-tight">
              {userName}
            </p>
            <p className="text-[12px] text-[#65676b] dark:text-[#b0b3b8]">
              Share a photo or write something.
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onFormChange({ mode: "photo" })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              form.mode === "photo"
                ? "bg-[#e7f3ff] text-[#1877f2]"
                : "bg-[#f0f2f5] dark:bg-[#3a3b3c] text-[#65676b] hover:bg-[#e4e6eb]"
            }`}
          >
            <ImageIcon size={14} />
            Photo
          </button>
          <button
            onClick={() => onFormChange({ mode: "text" })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              form.mode === "text"
                ? "bg-[#e7f3ff] text-[#1877f2]"
                : "bg-[#f0f2f5] dark:bg-[#3a3b3c] text-[#65676b] hover:bg-[#e4e6eb]"
            }`}
          >
            <Type size={14} />
            Text
          </button>
        </div>
      </div>

      {/* Text input — only in text mode */}
      {form.mode === "text" && (
        <div className="px-4 mb-3">
          <textarea
            value={form.text}
            onChange={(e) => onFormChange({ text: e.target.value })}
            placeholder="Start typing..."
            maxLength={200}
            rows={3}
            className="w-full resize-none rounded-xl bg-[#f0f2f5] dark:bg-[#3a3b3c] text-[14px] text-[#050505] dark:text-white placeholder-[#65676b] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1877f2] transition"
          />
          <p className="text-right text-[11px] text-[#65676b] mt-0.5">
            {form.text.length}/200
          </p>
        </div>
      )}

      {/* Photo upload — only in photo mode */}
      {form.mode === "photo" && (
        <div className="px-4 mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-18 rounded-xl border-2 border-dashed border-[#1877f2] bg-[#e7f3ff] flex flex-col items-center justify-center gap-1 hover:bg-[#dbeafe] transition-colors"
          >
            <ImageIcon size={20} className="text-[#1877f2]" />
            <span className="text-[13px] font-medium text-[#1877f2]">
              {form.mediaFile ? "Change photo / video" : "Add photo or video"}
            </span>
          </button>
          {form.mediaFile && (
            <div className="flex items-center gap-2 mt-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-lg px-3 py-2">
              {form.mediaType === "video" ? (
                <VideoIcon size={13} className="text-[#65676b] shrink-0" />
              ) : (
                <ImageIcon size={13} className="text-[#65676b] shrink-0" />
              )}
              <p className="text-[12px] text-[#050505] dark:text-white truncate flex-1">
                {form.mediaFile.name}
              </p>
              <button
                onClick={() =>
                  onFormChange({
                    mediaFile: null,
                    mediaPreview: null,
                    mediaType: null,
                  })
                }
                className="text-[#65676b] hover:text-red-500 transition-colors shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Background colors */}
      <div className="px-4 mb-4">
        <p className="text-[13px] font-semibold text-[#050505] dark:text-white mb-2">
          Add Backgrounds
        </p>
        <div className="grid grid-cols-8 gap-1.5">
          {BACKGROUND_COLORS.map((bg) => (
            <button
              key={bg.hex}
              onClick={() => onFormChange({ backgroundColor: bg.hex })}
              className={`w-full aspect-square rounded-full transition-transform hover:scale-110 ${
                form.backgroundColor === bg.hex
                  ? "ring-2 ring-offset-2 ring-[#1877f2] scale-110"
                  : ""
              }`}
              style={{ background: bg.css }}
              title={bg.hex}
            />
          ))}
        </div>
      </div>

      {/* Privacy selector */}
      <div className="px-4 mb-4">
        <p className="text-[13px] font-semibold text-[#050505] dark:text-white mb-2">
          Audience
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {PRIVACY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFormChange({ privacy: opt.value })}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                form.privacy === opt.value
                  ? "bg-[#e7f3ff] text-[#1877f2] ring-1 ring-[#1877f2]"
                  : "bg-[#f0f2f5] dark:bg-[#3a3b3c] text-[#050505] dark:text-white hover:bg-[#e4e6eb]"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="px-4 pb-5 pt-2 border-t border-[#e4e6eb] dark:border-[#3a3b3c] flex gap-2">
        <button
          onClick={onDiscard}
          disabled={isPending}
          className="flex-1 py-2 rounded-lg bg-[#e4e6eb] dark:bg-[#3a3b3c] text-[14px] font-semibold text-[#050505] dark:text-white hover:bg-[#d8dadf] transition-colors disabled:opacity-50"
        >
          Discard
        </button>
        <button
          onClick={onShare}
          disabled={!canShare || isPending}
          className="flex-1 py-2 rounded-lg bg-[#1877f2] text-[14px] font-semibold text-white hover:bg-[#166fe5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Sharing…
            </>
          ) : (
            "Share to story"
          )}
        </button>
      </div>
    </aside>
  );
}
