"use client";

import {
  GroupVideo,
  useGetGroupVideos,
} from "@/hooks/features/groups/api/media/use-get-group-videos";
import { Clock, Play, Volume2, VolumeX, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EmptyState, SkeletonGrid } from "./group-media-container";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Video Player Modal ──────────────────────────────────────────────────────
function VideoPlayerModal({
  video,
  onClose,
}: {
  video: GroupVideo;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const authorName = `${video.author.firstName} ${video.author.lastName}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl bg-black">
          {/* Top bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-black/60">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 bg-gray-600 shrink-0">
                {video.author.profileImage?.url && (
                  <Image
                    src={video.author.profileImage.url}
                    alt={authorName}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                )}
              </div>
              <span className="text-xs text-white/80 font-medium">
                {authorName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Video */}
          <video
            ref={videoRef}
            src={video.media.url}
            controls
            playsInline
            className="w-full max-h-[70vh] bg-black"
          />
        </div>
      </div>
    </>
  );
}

// ── Videos Tab ──────────────────────────────────────────────────────────────
export default function VideosTab({
  groupId,
  accessToken,
}: {
  groupId: string;
  accessToken: string;
}) {
  const [selectedVideo, setSelectedVideo] = useState<GroupVideo | null>(null);

  const { data, isLoading, isError } = useGetGroupVideos({
    groupId,
    accessToken,
  });

  if (isLoading) return <SkeletonGrid />;
  if (isError)
    return (
      <p className="text-xs text-red-500 py-10 text-center">
        Failed to load videos.
      </p>
    );
  if (!data?.data?.length) return <EmptyState label="videos" />;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
        {data.data.map((video) => (
          <div
            key={video.media._id}
            onClick={() => setSelectedVideo(video)}
            className="group relative aspect-square overflow-hidden rounded-sm bg-gray-900 cursor-pointer"
          >
            {/* Thumbnail */}
            {video.media.thumbnail ? (
              <Image
                src={video.media.thumbnail}
                alt={`Video by ${video.author.firstName}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-800" />
            )}

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-2.5 group-hover:bg-black/70 transition-colors">
                <Play size={18} className="text-white fill-white" />
              </div>
            </div>

            {/* Duration badge */}
            {video.media.duration != null && (
              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
                <Clock size={10} />
                {formatDuration(video.media.duration)}
              </div>
            )}

            {/* Author avatar on hover */}
            <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {video.author.profileImage?.url && (
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white bg-gray-600">
                  <Image
                    src={video.author.profileImage.url}
                    alt={video.author.firstName}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}
