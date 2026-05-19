"use client";

import { DEFAULT_IMAGES } from "@/constants";
import { cn } from "@/lib/utils";
import { Reel } from "@/types/features/reels";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ReelInfoProps {
  reel: Reel;
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "");
const CAPTION_LIMIT = 80;

export const ReelInfo = ({ reel }: ReelInfoProps) => {
  const [expanded, setExpanded] = useState(false);

  const author = reel.author;
  const avatarUrl = author?.profileImage?.url || DEFAULT_IMAGES.user.avatar;
  const displayName =
    author?.firstName || author?.lastName
      ? `${author?.firstName ?? ""} ${author?.lastName ?? ""}`.trim()
      : author?.username || "Unknown";

  const rawCaption = reel.content
    ? stripHtml(reel.content).trim()
    : reel.title || "";

  const isLong = rawCaption.length > CAPTION_LIMIT;
  const caption =
    !expanded && isLong ? `${rawCaption.slice(0, CAPTION_LIMIT)}…` : rawCaption;

  const createdAt = reel.createdAt
    ? formatDistanceToNow(new Date(reel.createdAt), { addSuffix: true })
    : "";

  return (
    <div className="flex flex-col gap-2 text-white">
      <div className="flex items-center gap-2">
        <Link
          href={author?.username ? `/public/profile/${author.username}` : "#"}
          className="flex items-center gap-2 group"
        >
          <Image
            src={avatarUrl}
            alt={displayName}
            width={36}
            height={36}
            className="rounded-full object-cover border border-white/30 shrink-0"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold drop-shadow group-hover:underline">
              {displayName}
            </span>
            {createdAt && (
              <span className="text-[11px] text-white/75">{createdAt}</span>
            )}
          </div>
        </Link>
      </div>

      {rawCaption && (
        <div
          className={cn(
            "text-[13px] leading-snug drop-shadow max-w-[88%]",
            "whitespace-pre-wrap break-words",
          )}
        >
          {caption}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="ml-1 text-[12px] font-semibold text-white/90 hover:underline"
            >
              {expanded ? "less" : "more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
