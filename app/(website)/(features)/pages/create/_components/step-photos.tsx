"use client";

import { Camera, ImagePlus, User } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

interface StepPhotosProps {
  profilePreview: string | null;
  coverPreview: string | null;
  onProfileChange: (file: File) => void;
  onCoverChange: (file: File) => void;
}

export function StepPhotos({
  profilePreview,
  coverPreview,
  onProfileChange,
  onCoverChange,
}: StepPhotosProps) {
  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  function handleProfileFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onProfileChange(file);
  }

  function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCoverChange(file);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Customise your Page
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your profile picture is one of the first things that people see. Try
          using your logo or a simple image that people can easily associate
          with you.
        </p>
      </div>

      {/* Cover photo */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Cover photo</p>
        <div
          className="relative w-full h-36 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-blue-300 transition-colors group"
          onClick={() => coverRef.current?.click()}
        >
          {coverPreview ? (
            <Image
              src={coverPreview}
              alt="Cover preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                <ImagePlus
                  size={18}
                  className="text-gray-400 group-hover:text-blue-400"
                />
              </div>
              <p className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">
                Add cover photo
              </p>
            </div>
          )}

          {/* Edit overlay when image exists */}
          {coverPreview && (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                <Camera size={16} className="text-gray-700" />
              </div>
            </div>
          )}

          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFile}
          />
        </div>
      </div>

      {/* Profile photo */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Profile picture
        </p>
        <div className="flex items-center gap-5">
          {/* Avatar preview */}
          <div
            className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-blue-300 transition-colors group shrink-0"
            onClick={() => profileRef.current?.click()}
          >
            {profilePreview ? (
              <Image
                src={profilePreview}
                alt="Profile preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <User size={36} className="text-gray-300" />
              </div>
            )}

            {/* Camera badge */}
            <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-sm">
              <Camera size={13} className="text-white" />
            </div>

            {profilePreview && (
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={18} className="text-white" />
              </div>
            )}

            <input
              ref={profileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileFile}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-800 mb-1">
              Upload a profile picture
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Recommended: square image, at least 180×180px. PNG or JPG.
            </p>
            <button
              onClick={() => profileRef.current?.click()}
              className="mt-2 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              Choose photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
