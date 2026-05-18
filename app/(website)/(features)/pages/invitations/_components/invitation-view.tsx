"use client";

import { useDiscoverPages } from "@/hooks/features/pages/use-discover-pages";
import { Page } from "@/types/features/pages";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { PageCard } from "../../_components/page-card";

interface InvitationsViewProps {
  accessToken: string;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-35 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-200 rounded w-1/2" />
            <div className="h-2.5 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
          <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function NoPendingInvitations() {
  return (
    <div className="flex flex-col items-center py-8 mb-6 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <UserPlus size={26} className="text-gray-400" />
      </div>
      <p className="text-base font-semibold text-gray-700">
        No pending invitations
      </p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">
        When someone invites you to like or manage a Page, it will appear here
      </p>
    </div>
  );
}

export function InvitationsView({ accessToken }: InvitationsViewProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // TODO: Replace with a real invitations endpoint when available
  // For now, reusing discover pages as the suggested section (matches Figma)
  const { data, isLoading, isError } = useDiscoverPages({ accessToken });

  // Pending invitations — wire to real invitation API when ready
  const pendingInvitations: Page[] = [];

  const suggested: Page[] = (data?.data ?? []).filter(
    (p) => !dismissed.has(p._id),
  );

  function handleAccept(id: string) {
    // Wire to: accept invitation mutation
    console.log("accept invitation for page", id);
  }

  function handleDecline(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
    // Wire to: decline invitation mutation
  }

  function handleSuggestedAccept(id: string) {
    console.log("accept suggested page", id);
  }

  function handleSuggestedDecline(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Discover Pages</h2>

      {/* Pending invitations section */}
      {pendingInvitations.length === 0 ? (
        <NoPendingInvitations />
      ) : (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">
            Pending Invitations
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {pendingInvitations.map((page) => (
              <PageCard
                key={page._id}
                id={page._id}
                name={page.name}
                category={page.category}
                followersCount={page.followersCount}
                coverImage={page.coverImage?.url || undefined}
                profileImage={page.profileImage?.url || undefined}
                mode="invitations"
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </div>
        </div>
      )}

      {/* Suggested section */}
      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        Suggested for you
      </h3>

      {isError && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Failed to load suggestions. Please refresh.
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && suggested.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">
          No suggestions available
        </p>
      )}

      {!isLoading && suggested.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {suggested.map((page) => (
            <PageCard
              key={page._id}
              id={page._id}
              name={page.name}
              category={page.category}
              followersCount={page.followersCount}
              coverImage={page.coverImage?.url || undefined}
              profileImage={page.profileImage?.url || undefined}
              mode="invitations"
              onAccept={handleSuggestedAccept}
              onDecline={handleSuggestedDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
