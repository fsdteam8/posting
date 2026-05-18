"use client";

import { useGetProfileByUsername } from "@/hooks/profile/use-get-profile-by-username";
import { SentRequestsApiRes } from "@/types/features/friends";
import { useQueryClient } from "@tanstack/react-query";
import PublicProfileHeader from "./public-profile-header";

interface PublicProfileLayoutClientProps {
  username: string;
  accessToken: string;
  loggedInUserId: string;
  children: React.ReactNode;
}

export function PublicProfileLayoutClient({
  username,
  accessToken,
  loggedInUserId,
  children,
}: PublicProfileLayoutClientProps) {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetProfileByUsername({
    username,
    accessToken,
  });

  // Derive pendingRequestId from the outgoing requests cache — no extra API call.
  // This is already populated if the user visited /friends/requests in this session.
  // If the cache is cold it returns undefined — the header handles that gracefully.
  const sentRequestsCache = queryClient.getQueryData<SentRequestsApiRes>([
    "friend-requests",
    "outgoing",
  ]);

  const pendingRequest = sentRequestsCache?.data?.find(
    (r) => r.recipient._id === profile?._id && r.status === "pending",
  );

  const pendingRequestId = pendingRequest?._id;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f0f2f5]">
      {/* ── Gradient blobs ── */}
      <div
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-44 -left-40 size-150 rounded-full bg-radial from-violet-500 to-purple-600 opacity-30 blur-[90px] animate-[blobFloat_14s_ease-in-out_infinite_alternate]" />
        <div className="absolute -top-24 -right-36 size-125 rounded-full bg-radial from-amber-400 to-red-500 opacity-30 blur-[90px] animate-[blobFloat_11s_ease-in-out_infinite_alternate_-4s]" />
        <div className="absolute bottom-[10%] left-[20%] size-105 rounded-full bg-radial from-cyan-400 to-blue-500 opacity-30 blur-[90px] animate-[blobFloat_16s_ease-in-out_infinite_alternate_-7s]" />
        <div className="absolute bottom-[5%] right-[10%] size-90 rounded-full bg-radial from-pink-400 to-rose-500 opacity-30 blur-[90px] animate-[blobFloat_13s_ease-in-out_infinite_alternate_-2s]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-270 mx-auto px-4 py-6 pb-12 flex flex-col gap-5">
        {/* Loading */}
        {isLoading && (
          <>
            <div className="h-80 rounded-2xl bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[400%_100%] animate-[shimmer_1.4s_infinite]" />
            <div className="h-64 rounded-2xl bg-white/60" />
          </>
        )}

        {/* Error / not found */}
        {!isLoading && (isError || !profile) && (
          <div className="p-10 text-center text-red-500 text-sm bg-white rounded-2xl shadow-sm">
            Profile not found or failed to load.
          </div>
        )}

        {/* Loaded */}
        {!isLoading && !isError && profile && (
          <>
            <PublicProfileHeader
              profile={profile}
              isOwner={profile._id === loggedInUserId}
              basePath={`/profile/${username}`}
              loggedInUserId={loggedInUserId}
              accessToken={accessToken}
              pendingRequestId={pendingRequestId}
            />
            <div className="w-full">{children}</div>
          </>
        )}
      </div>
    </div>
  );
}
