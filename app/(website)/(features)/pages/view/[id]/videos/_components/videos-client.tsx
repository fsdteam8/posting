"use client";

import { useGetPageById } from "@/hooks/features/pages/use-get-page-by-id";
import { useGetPagePostsInfinite } from "@/hooks/features/pages/use-get-page-posts-infinite";
import type { VideoInfo } from "@/types/features/posts";
import { Eye, Loader2, Play, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

interface Props {
  pageId: string;
  accessToken: string;
}

type VideoTile = {
  key: string;
  postId: string;
  videoUrl: string;
  thumbnail?: string;
  duration: number;
  views: number;
  contentSnippet: string;
};

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function VideosClient({ pageId, accessToken }: Props) {
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

  const videos: VideoTile[] = useMemo(() => {
    const posts = (data?.pages ?? []).flatMap((p) => p.data ?? []);
    const tiles: VideoTile[] = [];

    for (const post of posts) {
      if (!post) continue;

      // Collect new-style `videos[]` and legacy single `video`
      const list: VideoInfo[] = [];
      if (post.videos?.length) list.push(...post.videos.filter((v) => v?.url));
      if (post.video?.url) {
        list.push({
          id: "legacy",
          url: post.video.url,
          public_id: post.video.public_id,
          thumbnail: post.video.thumbnail,
          duration: post.video.duration,
        });
      }

      for (const v of list) {
        tiles.push({
          key: `${post._id}-${v.url}`,
          postId: post._id,
          videoUrl: v.url,
          thumbnail: v.thumbnail,
          duration: v.duration ?? 0,
          views: post.views ?? 0,
          contentSnippet: stripHtml(post.content).slice(0, 80),
        });
      }
    }
    return tiles;
  }, [data]);

  const pageName = page?.name ?? "This page";
  const totalPostsKnown = data?.pages[0]?.pagination?.total;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {pageName}&apos;s Videos
          </h1>
          <p className="text-sm text-gray-500">
            {videos.length.toLocaleString()}{" "}
            {videos.length === 1 ? "video" : "videos"}
            {totalPostsKnown !== undefined &&
              ` · from ${totalPostsKnown.toLocaleString()} posts`}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-gray-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-red-500">
          {error?.message ?? "Failed to load videos."}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Video className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900">No videos yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            When this page posts videos, they&apos;ll show up here.
          </p>
        </div>
      )}

      {/* Grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {videos.map((v) => (
            <VideoTileItem key={v.key} video={v} />
          ))}
        </div>
      )}

      {/* Sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {!hasNextPage && videos.length > 0 && !isLoading && (
        <p className="text-center text-xs text-gray-500 pt-2 pb-4">
          You&apos;re all caught up
        </p>
      )}
    </div>
  );
}

// ─── Tile ────────────────────────────────────────────────────────────────────

function VideoTileItem({ video }: { video: VideoTile }) {
  const durationLabel = formatDuration(video.duration);

  return (
    <Link
      href={`/posts/${video.postId}`}
      className="block group rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-black overflow-hidden">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt="Video thumbnail"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <video
            src={video.videoUrl}
            preload="metadata"
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
          <div className="w-12 h-12 rounded-full bg-black/55 group-hover:bg-black/75 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {durationLabel && (
          <span className="absolute bottom-2 right-2 text-white text-[11px] font-semibold bg-black/65 px-1.5 py-0.5 rounded">
            {durationLabel}
          </span>
        )}

        {/* Views chip */}
        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-white text-[11px] font-medium bg-black/55 px-1.5 py-0.5 rounded">
          <Eye className="w-3 h-3" />
          {formatCount(video.views)}
        </div>
      </div>

      {video.contentSnippet && (
        <p className="px-3 py-2.5 text-[13px] text-gray-700 line-clamp-2">
          {video.contentSnippet}
        </p>
      )}
    </Link>
  );
}
