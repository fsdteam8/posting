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

  // Group reactions by type
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
      if (type in groups) {
        (groups[type] as Reaction[]).push(reaction);
      }
    });

    return groups;
  }, [reactions]);

  // Count reactions
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
      if (reaction.type in counts) {
        counts[reaction.type]++;
      }
    });

    return counts;
  }, [reactions]);

  const displayReactions = selectedReaction
    ? reactionGroups[selectedReaction]
    : reactionGroups.all;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedReaction
              ? `${reactionEmojis[selectedReaction]} ${selectedReaction.charAt(0).toUpperCase() + selectedReaction.slice(1)}`
              : "All Reactions"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Reaction Tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-gray-200 scrollbar-hide">
          <button
            onClick={() => setSelectedReaction(null)}
            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              selectedReaction === null
                ? "bg-blue-100 text-blue-600 border-b-2 border-blue-500"
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
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedReaction === type
                    ? "bg-blue-100 text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{reactionEmojis[type]}</span>
                <span>{count}</span>
              </button>
            ))}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {displayReactions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No reactions yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayReactions.map((reaction) => (
                <div
                  key={reaction.user._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {reaction.user.profileImage?.url ? (
                        <Image
                          src={reaction.user.profileImage.url}
                          alt={reaction.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                          height={40}
                          width={40}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                          {reaction.user.firstName[0]}
                          {reaction.user.lastName[0]}
                        </div>
                      )}
                      {/* Reaction Badge */}
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full border-2 border-white text-[10px]">
                        {reactionEmojis[reaction.type]}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {reaction.user.name}
                      </p>
                      {reaction.mutualFriendCount > 0 && (
                        <p className="text-xs text-gray-500">
                          {reaction.mutualFriendCount}{" "}
                          {reaction.mutualFriendCount === 1
                            ? "mutual friend"
                            : "mutual friends"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {reaction.user._id !== loggedInUserId && (
                    <div className="shrink-0 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm font-medium"
                      >
                        {reaction.isMutualFriend ? "Following" : "Follow"}
                      </Button>
                    </div>
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
