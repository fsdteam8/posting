"use client";

import { useGetPageById } from "@/hooks/features/pages/use-get-page-by-id";
import { useGetPagePostsInfinite } from "@/hooks/features/pages/use-get-page-posts-infinite";
import { ImageIcon, Loader2, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  pageId: string;
  accessToken: string;
}

type PhotoTile = {
  key: string;
  url: string;
  postId: string;
  reactionCount: number;
  commentCount: number;
  shareCount: number;
};

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function PhotosClient({ pageId, accessToken }: Props) {
  const { data: pageRes } = useGetPageById({ pageId, accessToken });
  const page = pageRes?.data;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPagePostsInfinite({ pageId, accessToken, limit: 20 });

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "profile" | "cover">(
    "all",
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPhotos: PhotoTile[] = useMemo(() => {
    const posts = (data?.pages ?? []).flatMap((p) => p.data ?? []);
    const tiles: PhotoTile[] = [];
    for (const post of posts) {
      if (!post) continue;
      for (const img of post.images ?? []) {
        if (!img?.url) continue;
        tiles.push({
          key: `${post._id}-${img.url}`,
          url: img.url,
          postId: post._id,
          reactionCount: post.reactionCount ?? 0,
          commentCount: post.commentCount ?? 0,
          shareCount: post.shareCount ?? 0,
        });
      }
    }
    return tiles;
  }, [data]);

  const profilePhotos: PhotoTile[] = page?.profileImage?.url
    ? [
        {
          key: `profile-${page.profileImage.url}`,
          url: page.profileImage.url,
          postId: "",
          reactionCount: 0,
          commentCount: 0,
          shareCount: 0,
        },
      ]
    : [];

  const coverPhotos: PhotoTile[] = page?.coverImage?.url
    ? [
        {
          key: `cover-${page.coverImage.url}`,
          url: page.coverImage.url,
          postId: "",
          reactionCount: 0,
          commentCount: 0,
          shareCount: 0,
        },
      ]
    : [];

  const visiblePhotos =
    activeTab === "profile"
      ? profilePhotos
      : activeTab === "cover"
        ? coverPhotos
        : allPhotos;

  const pageName = page?.name ?? "This page";
  const totalPostsKnown = data?.pages[0]?.pagination?.total;

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
        {pageName}&apos;s Photos
      </h1>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CategoryCard
          label="All Photos"
          itemCount={allPhotos.length}
          coverUrl={allPhotos[0]?.url}
          active={activeTab === "all"}
          onSelect={() => setActiveTab("all")}
        />
        <CategoryCard
          label="Profile Pictures"
          itemCount={profilePhotos.length}
          coverUrl={profilePhotos[0]?.url}
          active={activeTab === "profile"}
          onSelect={() => setActiveTab("profile")}
        />
        <CategoryCard
          label="Cover Photos"
          itemCount={coverPhotos.length}
          coverUrl={coverPhotos[0]?.url}
          active={activeTab === "cover"}
          onSelect={() => setActiveTab("cover")}
        />
      </div>

      {/* Active section heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {activeTab === "all"
            ? "All Photos"
            : activeTab === "profile"
              ? "Profile Pictures"
              : "Cover Photos"}
        </h2>
        {activeTab === "all" && totalPostsKnown !== undefined && (
          <span className="text-sm text-gray-500">
            From {totalPostsKnown.toLocaleString()} posts
          </span>
        )}
      </div>

      {/* Initial loading */}
      {isLoading && activeTab === "all" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && activeTab === "all" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-red-500">
          {error?.message ?? "Failed to load photos."}
        </div>
      )}

      {/* Empty */}
      {!isLoading &&
        !isError &&
        visiblePhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-900">
              No photos yet
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              {activeTab === "all"
                ? "When this page posts photos, they'll show up here."
                : activeTab === "profile"
                  ? "No profile picture has been uploaded."
                  : "No cover photo has been uploaded."}
            </p>
          </div>
        )}

      {/* Grid */}
      {visiblePhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visiblePhotos.map((photo) => (
            <PhotoTileItem key={photo.key} photo={photo} />
          ))}
        </div>
      )}

      {/* Infinite-scroll sentinel (only on All Photos) */}
      {activeTab === "all" && (
        <>
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
          {!hasNextPage && allPhotos.length > 0 && !isLoading && (
            <p className="text-center text-xs text-gray-500 pt-2 pb-4">
              You&apos;re all caught up
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface CategoryCardProps {
  label: string;
  itemCount: number;
  coverUrl?: string;
  active: boolean;
  onSelect: () => void;
}

function CategoryCard({
  label,
  itemCount,
  coverUrl,
  active,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group text-left transition-all ${
        active ? "ring-2 ring-primary" : "ring-1 ring-gray-100 hover:ring-gray-200"
      } rounded-xl overflow-hidden bg-white`}
    >
      <div className="relative aspect-4/3 bg-gray-100">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={label}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-300" />
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">
          {itemCount.toLocaleString()} {itemCount === 1 ? "Item" : "Items"}
        </p>
      </div>
    </button>
  );
}

function PhotoTileItem({ photo }: { photo: PhotoTile }) {
  const isPostLinked = Boolean(photo.postId);
  const hasStats =
    photo.reactionCount > 0 || photo.commentCount > 0 || photo.shareCount > 0;

  const inner = (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 group">
      <Image
        src={photo.url}
        alt="Photo"
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* Hover overlay */}
      {isPostLinked && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
      )}

      {/* Engagement chips (post-derived) */}
      {hasStats && (
        <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 bg-linear-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-2 text-white text-[11px] font-medium">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {formatCount(photo.reactionCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {formatCount(photo.commentCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              {formatCount(photo.shareCount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (isPostLinked) {
    return (
      <Link
        href={`/posts/${photo.postId}`}
        className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
