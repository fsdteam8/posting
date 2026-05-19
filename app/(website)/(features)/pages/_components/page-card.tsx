"use client";

import { X } from "lucide-react";
import Image from "next/image";

type CardMode = "discover" | "liked" | "invitations";

interface PageCardProps {
  id: string;
  name: string;
  category: string;
  followersCount: number;
  coverImage?: string;
  profileImage?: string;
  mode: CardMode;
  onLike?: (id: string) => void;
  onRemove?: (id: string) => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  isLiked?: boolean;
  isPending?: boolean;
}

const PLACEHOLDER_COVERS = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=220&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=220&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=220&fit=crop",
  "https://images.unsplash.com/photo-1521038199265-bc482db0f923?w=400&h=220&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=220&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=220&fit=crop",
];

const PLACEHOLDER_AVATARS = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=40&h=40&fit=crop",
];

function hashIndex(str: string, len: number) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % len;
  return h;
}

export function PageCard({
  id,
  name,
  category,
  followersCount,
  coverImage,
  profileImage,
  mode,
  onLike,
  onRemove,
  onAccept,
  onDecline,
  isPending,
  isLiked,
}: PageCardProps) {
  const cover =
    coverImage || PLACEHOLDER_COVERS[hashIndex(id, PLACEHOLDER_COVERS.length)];
  const avatar =
    profileImage ||
    PLACEHOLDER_AVATARS[hashIndex(id, PLACEHOLDER_AVATARS.length)];

  const formatFollowers = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      {/* Cover Image */}
      <div className="relative h-35 bg-gray-200 overflow-hidden">
        <Image
          src={cover}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Dismiss X */}
        <button
          onClick={() => onRemove?.(id)}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
        >
          <X size={14} className="text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={avatar}
            alt={name}
            width={32}
            height={32}
            className="rounded-full border-2 border-white shadow-sm object-cover h-8"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {name}
            </p>
            <p className="text-xs text-gray-500 truncate">{category}</p>
            <p className="text-xs text-gray-400">
              {formatFollowers(followersCount)} people follow this Page
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          {mode === "discover" && (
            <>
              <button
                onClick={() => onLike?.(id)}
                disabled={isPending}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  isLiked
                    ? "bg-blue-100 text-primary"
                    : "bg-primary text-white hover:bg-primary/90"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isPending ? "..." : isLiked ? "Liked" : "Like"}
              </button>
              <button
                onClick={() => onRemove?.(id)}
                className="flex-1 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Remove
              </button>
            </>
          )}

          {mode === "liked" && (
            <>
              <button className="flex-1 py-1.5 text-sm font-semibold rounded-lg bg-primary text-white cursor-default">
                Liked
              </button>
              <button
                onClick={() => onRemove?.(id)}
                className="flex-1 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Remove
              </button>
            </>
          )}

          {mode === "invitations" && (
            <>
              <button
                onClick={() => onAccept?.(id)}
                className="flex-1 py-1.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => onDecline?.(id)}
                className="flex-1 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Decline
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
