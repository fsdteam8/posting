"use client";

import { Profile } from "@/hooks/profile/use-profile";
import { useUpdateProfile } from "@/hooks/profile/use-update-profile";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useState } from "react";

interface BioCardProps {
  profile: Profile;
  isOwner: boolean;
  accessToken: string;
}

const MAX_BIO_LENGTH = 200;

export function BioCard({ profile, isOwner, accessToken }: BioCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(profile.bio ?? "");

  const { mutate, isPending } = useUpdateProfile({ accessToken });

  const handleSave = () => {
    const trimmed = value.trim();

    // No change — skip the network call
    if (trimmed === (profile.bio ?? "").trim()) {
      setIsEditing(false);
      return;
    }

    mutate(
      { bio: trimmed },
      {
        onSuccess: (res) => {
          if (res.success) setIsEditing(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setValue(profile.bio ?? "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">Bio</h3>

        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0"
            aria-label="Edit bio"
          >
            <Pencil size={14} className="text-gray-400" />
          </button>
        )}

        {isOwner && isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
              aria-label="Cancel"
            >
              <X size={14} className="text-gray-400" />
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="p-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
              aria-label="Save bio"
            >
              {isPending ? (
                <Loader2 size={14} className="text-green-500 animate-spin" />
              ) : (
                <Check size={14} className="text-green-500" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* View mode */}
      {!isEditing && (
        <>
          {profile.bio ? (
            <p className="text-[13px] text-gray-500 text-center italic leading-relaxed">
              {profile.bio}
            </p>
          ) : (
            <button
              onClick={() => isOwner && setIsEditing(true)}
              className={[
                "w-full text-[13px] text-center italic py-2 rounded-lg transition-colors bg-transparent border-0",
                isOwner
                  ? "text-blue-400 hover:bg-blue-50 cursor-pointer"
                  : "text-gray-400 cursor-default",
              ].join(" ")}
            >
              {isOwner ? "+ Add a bio" : "No bio yet."}
            </button>
          )}
        </>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="flex flex-col gap-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_BIO_LENGTH}
            rows={3}
            autoFocus
            placeholder="Write something about yourself..."
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              ⌘ + Enter to save &middot; Esc to cancel
            </p>
            <span
              className={[
                "text-[11px] font-medium tabular-nums",
                value.length >= MAX_BIO_LENGTH
                  ? "text-red-400"
                  : "text-gray-400",
              ].join(" ")}
            >
              {value.length}/{MAX_BIO_LENGTH}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
