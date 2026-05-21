"use client";

import Image from "next/image";
import { StoryFormState } from "./StoryCreatorSidebar";

const BACKGROUND_COLORS: Record<string, string> = {
  "#f97316": "linear-gradient(135deg,#f97316,#ec4899)",
  "#7c3aed": "linear-gradient(135deg,#7c3aed,#ec4899)",
  "#06b6d4": "linear-gradient(135deg,#06b6d4,#3b82f6)",
  "#10b981": "linear-gradient(135deg,#10b981,#06b6d4)",
  "#1d4ed8": "linear-gradient(135deg,#1d4ed8,#7c3aed)",
  "#f59e0b": "linear-gradient(135deg,#f59e0b,#ef4444)",
  "#ec4899": "linear-gradient(135deg,#ec4899,#f43f5e)",
  "#84cc16": "linear-gradient(135deg,#84cc16,#10b981)",
  "#f43f5e": "linear-gradient(135deg,#f43f5e,#f97316)",
  "#8b5cf6": "linear-gradient(135deg,#8b5cf6,#06b6d4)",
  "#0ea5e9": "linear-gradient(135deg,#0ea5e9,#6366f1)",
  "#d97706": "linear-gradient(135deg,#d97706,#dc2626)",
  "#1877f2": "#1877f2",
  "#3b5998": "#3b5998",
  "#111827": "#111827",
  "#ffffff": "#ffffff",
};

function getTextColor(bg: string) {
  if (bg === "#ffffff") return "#050505";
  return "#ffffff";
}

interface Props {
  form: StoryFormState;
  userName: string;
  userAvatar?: string;
}

export function StoryCreatorPreview({ form, userName, userAvatar }: Props) {
  const bgStyle =
    BACKGROUND_COLORS[form.backgroundColor] ?? form.backgroundColor;
  const textColor = getTextColor(form.backgroundColor);

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-[#f0f2f5] dark:bg-[#18191a] overflow-auto py-6 px-4">
      {/* Label */}
      <p className="text-[13px] font-medium text-[#65676b] dark:text-[#b0b3b8] mb-4 tracking-wide uppercase">
        Preview
      </p>

      {/* Story card preview */}
      <div
        className="relative w-75 h-133.25 rounded-2xl overflow-hidden shadow-2xl shrink-0"
        style={{ background: bgStyle }}
      >
        {/* Photo mode — image */}
        {form.mode === "photo" &&
          form.mediaPreview &&
          form.mediaType !== "video" && (
            <Image
              src={form.mediaPreview}
              alt="Story preview"
              fill
              className="object-cover"
            />
          )}

        {/* Photo mode — video */}
        {form.mode === "photo" &&
          form.mediaPreview &&
          form.mediaType === "video" && (
            <video
              src={form.mediaPreview}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          )}

        {/* Overlay gradient for photo mode */}
        {form.mode === "photo" && form.mediaPreview && (
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/50" />
        )}

        {/* Empty photo placeholder */}
        {form.mode === "photo" && !form.mediaPreview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-40">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-white text-[13px] font-medium">
              Add a photo or video
            </p>
          </div>
        )}

        {/* User bar at top */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-10">
          {/* Progress bar */}
          <div className="absolute -top-2 left-0 right-0 h-0.75 bg-white/40 rounded-full">
            <div className="h-full w-2/3 bg-white rounded-full" />
          </div>

          <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shrink-0 bg-[#1877f2]">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-white text-[12px] font-semibold drop-shadow leading-tight">
              {userName}
            </p>
            <p className="text-white/70 text-[10px]">Just now</p>
          </div>
        </div>

        {/* Centered text in text mode */}
        {form.mode === "text" && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              className="text-center text-[22px] font-bold leading-snug wrap-break-words"
              style={{
                color: textColor,
                textShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              {form.text || (
                <span className="opacity-40" style={{ color: textColor }}>
                  Start typing...
                </span>
              )}
            </p>
          </div>
        )}

        {/* Text overlay on photo */}
        {form.mode === "photo" && form.text && (
          <div className="absolute bottom-12 left-3 right-3 z-10">
            <p className="text-white text-[15px] font-semibold drop-shadow text-center">
              {form.text}
            </p>
          </div>
        )}

        {/* Emoji reaction row at bottom */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
          {["❤️", "😮", "😂", "😢", "👍"].map((emoji) => (
            <div
              key={emoji}
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-sm"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Caption hint */}
      <p className="text-[11px] text-[#65676b] dark:text-[#b0b3b8] mt-4 text-center max-w-70">
        This is how your story will appear to others. Stories disappear after 24
        hours.
      </p>
    </div>
  );
}
