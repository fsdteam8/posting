"use client";

import { Post } from "@/types/features/posts";
import { formatDistanceToNow } from "date-fns";
import { Globe, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PostAuthorCardProps {
  post: Post;
}

// ─── Small visibility badge ───────────────────────────────────────────────────

function VisibilityBadge({ visibility }: { visibility: string }) {
  const isPublic = visibility === "public";
  return (
    <span className="flex items-center gap-1 text-[12px] text-fb-text-secondary">
      {isPublic ? <Globe className="w-3 h-3" /> : <Users className="w-3 h-3" />}
      {isPublic ? "Public" : "Friends"}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PostAuthorCard({ post }: PostAuthorCardProps) {
  const author = post.author as {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    profileImage: { url: string };
  };

  const fullName = `${author.firstName} ${author.lastName}`.trim();
  const avatarUrl = author.profileImage?.url;

  const timeAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : "";

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 flex items-start gap-3">
      {/* Avatar */}
      <Link href={`/profile/${author._id}`} className="shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            // Fallback initials avatar
            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-[15px] font-semibold">
              {author.firstName?.[0]}
              {author.lastName?.[0]}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${author._id}`}
          className="text-[15px] font-semibold text-fb-text-primary hover:underline"
        >
          {fullName}
        </Link>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[12px] text-fb-text-secondary">{timeAgo}</span>
          <span className="text-[12px] text-fb-text-secondary">·</span>
          <VisibilityBadge visibility={post.visibility} />
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {[
            { label: "Reactions", value: post.reactionCount },
            { label: "Comments", value: post.commentCount },
            { label: "Shares", value: post.shareCount },
            { label: "Views", value: post.views },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-[14px] font-semibold text-fb-text-primary">
                {value.toLocaleString()}
              </span>
              <span className="text-[11px] text-fb-text-secondary">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
