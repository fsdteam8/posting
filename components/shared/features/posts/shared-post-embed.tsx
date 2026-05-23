"use client";

import { DEFAULT_IMAGES } from "@/constants";
import type { Post } from "@/types/features/posts";
import { formatDistanceToNow } from "date-fns";
import { Globe, Lock, Play, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  /**
   * Whatever `post.sharedPost` is on the parent post. Could be a populated
   * Post, an unpopulated ObjectId string, or null when the original was
   * deleted/inaccessible at populate time.
   */
  shared: Post["sharedPost"];
}

const visibilityIcon = {
  public: <Globe className="w-3 h-3 text-fb-text-secondary" />,
  "only me": <Lock className="w-3 h-3 text-fb-text-secondary" />,
  friends: <Users className="w-3 h-3 text-fb-text-secondary" />,
  "friends of friends": <Users className="w-3 h-3 text-fb-text-secondary" />,
};

export function SharedPostEmbed({ shared }: Props) {
  if (!shared || typeof shared === "string") {
    return (
      <div className="mx-4 mb-3 rounded-lg border border-gray-200 bg-fb-hover/40 px-4 py-5 text-center">
        <p className="text-[14px] font-medium text-fb-text-primary">
          This post is unavailable
        </p>
        <p className="text-[12px] text-fb-text-secondary mt-0.5">
          It may have been removed or you don&apos;t have permission to view it.
        </p>
      </div>
    );
  }

  const author = shared.author;
  const avatarUrl = author?.profileImage?.url || DEFAULT_IMAGES.user.avatar;
  const fullName = `${author?.firstName ?? ""} ${author?.lastName ?? ""}`.trim();
  const timeAgo = shared.createdAt
    ? formatDistanceToNow(new Date(shared.createdAt), { addSuffix: true })
    : "";

  const visKey =
    shared.visibility && shared.visibility in visibilityIcon
      ? (shared.visibility as keyof typeof visibilityIcon)
      : null;

  return (
    <Link
      href={`/posts/${shared._id}`}
      className="block mx-4 mb-3 rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
    >
      {/* Embed header */}
      <div className="flex items-start gap-2 px-3 pt-3 pb-2">
        <Image
          src={avatarUrl}
          alt={fullName || "Author"}
          width={32}
          height={32}
          className="rounded-full object-cover shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-fb-text-primary truncate">
            {fullName || "Unknown"}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-fb-text-secondary">
            <span>{timeAgo}</span>
            {visKey && (
              <>
                <span aria-hidden>·</span>
                {visibilityIcon[visKey]}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Embed content */}
      {shared.content && (
        <div className="px-3 pb-2">
          <div
            className="text-[14px] text-fb-text-primary leading-relaxed
              prose prose-sm max-w-none line-clamp-6
              prose-p:my-1
              prose-strong:text-fb-text-primary
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-ul:my-1 prose-li:my-0.5
              prose-ol:my-1"
            dangerouslySetInnerHTML={{ __html: shared.content }}
          />
        </div>
      )}

      <EmbedMedia post={shared} />
    </Link>
  );
}

function EmbedMedia({ post }: { post: Post }) {
  const images = post.images ?? [];
  const videos = post.videos ?? [];

  if (images.length === 0 && videos.length === 0) return null;

  // Videos: show the first video as a static thumbnail (click navigates
  // to the full post via the wrapping <Link>).
  if (videos.length > 0) {
    const video = videos[0];
    return (
      <div className="relative aspect-video bg-black">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt="Video thumbnail"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-b from-[#2a1a1a] to-[#1a1a2a]" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
    );
  }

  // Images: compact grid, max 4 tiles + "+N" overlay on the last one.
  const visible = images.slice(0, 4);
  const extra = images.length - visible.length;

  if (visible.length === 1) {
    return (
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={visible[0].url}
          alt="Shared post image"
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`grid gap-0.5 bg-white ${
        visible.length === 2 ? "grid-cols-2" : "grid-cols-2"
      }`}
    >
      {visible.map((img, idx) => {
        const isLast = idx === visible.length - 1;
        return (
          <div
            key={img._id ?? img.url}
            className="relative aspect-square bg-gray-100"
          >
            <Image
              src={img.url}
              alt={`Shared post image ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover"
            />
            {isLast && extra > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xl font-bold">
                +{extra}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
