"use client";

import { Button } from "@/components/ui/button";
import { Reaction } from "@/types/features/posts";
import { X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

const reactionEmojis: Record<string, string> = {
  like: "👍",
  haha: "😄",
  wow: "😮",
  love: "❤️",
  sad: "😢",
  angry: "😠",
};

interface ReactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reactions: Reaction[];
  loggedInUserId: string;
}

export default function ReactionsModal({
  isOpen,
  onClose,
  reactions,
  loggedInUserId,
}: ReactionsModalProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const reactionGroups = useMemo(() => {
    const groups: Record<string, Reaction[]> = {
      all: reactions,
      like: [],
      haha: [],
      wow: [],
      sad: [],
      angry: [],
      love: [],
    };

    reactions.forEach((reaction) => {
      const type = reaction.type;
      if (type in groups) (groups[type] as Reaction[]).push(reaction);
    });

    return groups;
  }, [reactions]);

  const reactionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      like: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      angry: 0,
      love: 0,
    };

    reactions.forEach((reaction) => {
      if (reaction.type in counts) counts[reaction.type]++;
    });

    return counts;
  }, [reactions]);

  const displayReactions = selectedReaction
    ? reactionGroups[selectedReaction]
    : reactionGroups.all;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-2xl max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
          <h2 className="text-sm font-semibold text-gray-900">
            {selectedReaction
              ? `${reactionEmojis[selectedReaction]} ${
                  selectedReaction.charAt(0).toUpperCase() +
                  selectedReaction.slice(1)
                }`
              : "All Reactions"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-gray-200 px-3 py-2 scrollbar-hide">
          <button
            onClick={() => setSelectedReaction(null)}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              selectedReaction === null
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All ({reactions.length})
          </button>

          {Object.entries(reactionCounts)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => (
              <button
                key={type}
                onClick={() =>
                  setSelectedReaction(selectedReaction === type ? null : type)
                }
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedReaction === type
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-[13px] leading-none">
                  {reactionEmojis[type]}
                </span>
                <span>{count}</span>
              </button>
            ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {displayReactions.length === 0 ? (
            <div className="flex h-full items-center justify-center py-10 text-sm text-gray-500">
              No reactions yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayReactions.map((reaction) => (
                <div
                  key={reaction.user._id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {reaction.user.profileImage?.url ? (
                        <Image
                          src={reaction.user.profileImage.url}
                          alt={reaction.user.name}
                          className="h-8 w-8 rounded-full object-cover"
                          height={32}
                          width={32}
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700">
                          {reaction.user.firstName?.[0]}
                          {reaction.user.lastName?.[0]}
                        </div>
                      )}

                      {/* Reaction badge */}
                      <div className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-white ring-1 ring-gray-200 text-[10px] leading-none">
                        {reactionEmojis[reaction.type]}
                      </div>
                    </div>

                    {/* User */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {reaction.user.name}
                      </p>
                      {reaction.mutualFriendCount > 0 && (
                        <p className="text-[11px] text-gray-500">
                          {reaction.mutualFriendCount}{" "}
                          {reaction.mutualFriendCount === 1
                            ? "mutual friend"
                            : "mutual friends"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  {reaction.user._id !== loggedInUserId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs font-medium"
                    >
                      {reaction.isMutualFriend ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
