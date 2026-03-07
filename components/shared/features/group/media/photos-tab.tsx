"use client";

import {
  GroupPhoto,
  useGetGroupPhotos,
} from "@/hooks/features/groups/api/media/use-get-group-photos";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, SkeletonGrid } from "./group-media-container";

// ── Photo Lightbox ──────────────────────────────────────────────────────────
function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: GroupPhoto[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const current = photos[currentIndex];

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goPrev, goNext]);

  const authorName = `${current.author.firstName} ${current.author.lastName}`;
  const formattedDate = new Date(current.createdAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
        {/* Top bar */}
        <div className="pointer-events-auto w-full max-w-4xl flex items-center justify-between px-4 py-2.5 mb-2">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/20 bg-gray-600 shrink-0">
              {current.author.profileImage?.url && (
                <Image
                  src={current.author.profileImage.url}
                  alt={authorName}
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-white leading-tight">
                {authorName}
              </p>
              <p className="text-[11px] text-white/50">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-white/50 mr-2">
              {currentIndex + 1} / {photos.length}
            </span>

            <a
              href={current.media.url}
              download
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={15} />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Image + arrows */}
        <div className="pointer-events-auto relative flex items-center gap-3 px-4 w-full max-w-4xl">
          {/* Prev */}
          <button
            onClick={goPrev}
            disabled={photos.length <= 1}
            className="shrink-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-0"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Image — fill container, let CSS constrain height */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className="relative w-full" style={{ maxHeight: "75vh" }}>
              <Image
                key={current.media._id}
                src={current.media.url}
                alt={`Photo by ${authorName}`}
                width={1200}
                height={900}
                className="rounded-lg object-contain shadow-2xl w-auto mx-auto"
                style={{ maxHeight: "75vh", width: "auto" }}
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
          </div>

          {/* Next */}
          <button
            onClick={goNext}
            disabled={photos.length <= 1}
            className="shrink-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-0"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </>
  );
}

// ── Photos Tab ──────────────────────────────────────────────────────────────
export default function PhotosTab({
  groupId,
  accessToken,
}: {
  groupId: string;
  accessToken: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data, isLoading, isError } = useGetGroupPhotos({
    groupId,
    accessToken,
  });

  if (isLoading) return <SkeletonGrid />;
  if (isError)
    return (
      <p className="text-xs text-red-500 py-10 text-center">
        Failed to load photos.
      </p>
    );
  if (!data?.data?.length) return <EmptyState label="photos" />;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
        {data.data.map((photo, index) => (
          <div
            key={photo.media._id}
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-sm bg-gray-100 cursor-pointer"
          >
            <Image
              src={photo.media.url}
              alt={`Photo by ${photo.author.firstName}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={data.data}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

export { PhotoLightbox };
