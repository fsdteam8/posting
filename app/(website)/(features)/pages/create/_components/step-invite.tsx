"use client";

import { useGetAllFriends } from "@/hooks/features/friends/use-get-all-friends";
import type { Friend } from "@/types/features/friends";
import { Search, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface StepInviteProps {
  accessToken: string;
  selected: Set<string>;
  onToggle: (id: string) => void;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-2/5" />
      </div>
      <div className="w-5 h-5 rounded border-2 border-gray-200 bg-gray-100 shrink-0" />
    </div>
  );
}

function EmptyState({ isSearch }: { isSearch: boolean }) {
  return (
    <div className="flex flex-col items-center py-12 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        <Users size={22} className="text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">
        {isSearch
          ? "No friends match your search"
          : "You have no friends to invite yet"}
      </p>
    </div>
  );
}

function FriendRow({
  friend,
  isChecked,
  onToggle,
}: {
  friend: Friend;
  isChecked: boolean;
  onToggle: () => void;
}) {
  const fullName = `${friend.firstName} ${friend.lastName}`;
  const avatarUrl = friend.profileImage?.url;

  return (
    <label className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded-xl transition-colors">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-200">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-sm font-semibold">
            {friend.firstName[0]}
            {friend.lastName[0]}
          </div>
        )}
      </div>

      {/* Name + username */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
        {friend.username && (
          <p className="text-xs text-gray-400 truncate">@{friend.username}</p>
        )}
      </div>

      {/* Custom checkbox */}
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
          isChecked ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"
        }`}
      >
        {isChecked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={onToggle}
      />
    </label>
  );
}

export function StepInvite({
  accessToken,
  selected,
  onToggle,
}: StepInviteProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, isLoading, isError, isFetching } = useGetAllFriends({
    accessToken,
    page,
    limit: LIMIT,
  });

  const allFriends: Friend[] = data?.data ?? [];
  const totalFriends = data?.meta?.totalFriends ?? 0;
  const totalPages = data?.pagination?.pages ?? 1;

  // Client-side search filter on the loaded page
  const friends = allFriends.filter((f) => {
    const full = `${f.firstName} ${f.lastName} ${f.username}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  const allVisibleSelected =
    friends.length > 0 && friends.every((f) => selected.has(f._id));

  function handleSelectAll() {
    if (allVisibleSelected) {
      friends.forEach((f) => {
        if (selected.has(f._id)) onToggle(f._id);
      });
    } else {
      friends.forEach((f) => {
        if (!selected.has(f._id)) onToggle(f._id);
      });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Invite friends
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Grow your presence by inviting your friends to like your new Page.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search for friend"
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Select all row */}
      {!isLoading && friends.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {selected.size > 0
              ? `${selected.size} of ${totalFriends} selected`
              : `${totalFriends} friends`}
          </p>
          <button
            onClick={handleSelectAll}
            className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
          >
            {allVisibleSelected
              ? "Deselect All"
              : `Select All (${friends.length})`}
          </button>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
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
          Failed to load friends. Please try again.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col divide-y divide-gray-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && friends.length === 0 && (
        <EmptyState isSearch={search.length > 0} />
      )}

      {/* Friends list */}
      {!isLoading && friends.length > 0 && (
        <div className="flex flex-col divide-y divide-gray-50">
          {friends.map((friend) => (
            <FriendRow
              key={friend._id}
              friend={friend}
              isChecked={selected.has(friend._id)}
              onToggle={() => onToggle(friend._id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && !search && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isFetching}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isFetching ? "Loading..." : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
