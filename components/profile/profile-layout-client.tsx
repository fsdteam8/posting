"use client";

import { ProfileHeader } from "@/components/profile/profile-header";
import { useProfile } from "@/hooks/profile/use-profile";

interface ProfileLayoutClientProps {
  accessToken: string;
  children: React.ReactNode;
}

export function ProfileLayoutClient({
  accessToken,
  children,
}: ProfileLayoutClientProps) {
  const { data: profile, isLoading, isError } = useProfile(accessToken);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f0f2f5]">
      {/* ── Smashing gradient blobs behind everything ── */}
      <div
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {/* Blob 1 — purple/violet top-left */}
        <div className="absolute -top-44 -left-40 size-150 rounded-full bg-radial from-violet-500 to-purple-600 opacity-30 blur-[90px] animate-[blobFloat_14s_ease-in-out_infinite_alternate]" />
        {/* Blob 2 — amber/red top-right */}
        <div className="absolute -top-24 -right-36 size-125 rounded-full bg-radial from-amber-400 to-red-500 opacity-30 blur-[90px] animate-[blobFloat_11s_ease-in-out_infinite_alternate_-4s]" />
        {/* Blob 3 — cyan/blue bottom-left */}
        <div className="absolute bottom-[10%] left-[20%] size-105 rounded-full bg-radial from-cyan-400 to-blue-500 opacity-30 blur-[90px] animate-[blobFloat_16s_ease-in-out_infinite_alternate_-7s]" />
        {/* Blob 4 — pink/rose bottom-right */}
        <div className="absolute bottom-[5%] right-[10%] size-90 rounded-full bg-radial from-pink-400 to-rose-500 opacity-30 blur-[90px] animate-[blobFloat_13s_ease-in-out_infinite_alternate_-2s]" />
      </div>

      {/* ── Content area above blobs ── */}
      <div className="relative z-10 max-w-270 mx-auto px-4 py-6 pb-12 flex flex-col gap-5">
        {/* Loading state */}
        {isLoading && (
          <>
            <div className="h-80 rounded-2xl bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[400%_100%] animate-[shimmer_1.4s_infinite]" />
            <div className="h-64 rounded-2xl bg-white/60" />
          </>
        )}

        {/* Error state */}
        {!isLoading && (isError || !profile) && (
          <div className="p-10 text-center text-red-500 text-sm bg-white rounded-2xl shadow-sm">
            Failed to load profile. Please try again.
          </div>
        )}

        {/* Loaded state */}
        {!isLoading && !isError && profile && (
          <>
            <ProfileHeader
              profile={profile}
              isOwner={true}
              basePath="/profile"
            />
            <div className="w-full">{children}</div>
          </>
        )}
      </div>
    </div>
  );
}
