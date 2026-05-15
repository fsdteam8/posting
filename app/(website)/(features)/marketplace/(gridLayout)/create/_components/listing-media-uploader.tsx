"use client";

/**
 * ListingMediaUploader
 *
 * Handles photo and video selection for a marketplace listing form.
 * Does NOT upload anything — it just collects File objects and returns them
 * via onChange callbacks so the parent form can include them in FormData
 * on submit.
 *
 * Photos : up to 10 images, shown as a draggable-order grid with remove buttons.
 * Video  : single optional video file, shown with a thumbnail preview.
 *
 * Usage:
 *   <ListingMediaUploader
 *     photos={photos}
 *     onPhotosChange={setPhotos}
 *     video={video}
 *     onVideoChange={setVideo}
 *   />
 */

import { cn } from "@/lib/utils";
import {
  AlertCircle,
  GripVertical,
  ImagePlus,
  VideoIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_PHOTOS = 10;
const MAX_PHOTO_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// ─── Types ────────────────────────────────────────────────────────────────────

export type PhotoFile = {
  file: File;
  preview: string; // object URL for <img> src
};

type Props = {
  photos: PhotoFile[];
  onPhotosChange: (photos: PhotoFile[]) => void;
  video: File | null;
  onVideoChange: (video: File | null) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingMediaUploader({
  photos,
  onPhotosChange,
  video,
  onVideoChange,
}: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Drag state for reordering photos
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Validation error messages shown inline
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // ── Photo handlers ────────────────────────────────────────────────────────

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null);
    const files = Array.from(e.target.files ?? []);

    // Validate types
    const invalid = files.filter((f) => !ACCEPTED_IMAGE_TYPES.includes(f.type));
    if (invalid.length > 0) {
      setPhotoError("Only JPEG, PNG, WEBP, and GIF images are accepted.");
      e.target.value = "";
      return;
    }

    // Validate sizes
    const tooBig = files.filter(
      (f) => f.size > MAX_PHOTO_SIZE_MB * 1024 * 1024,
    );
    if (tooBig.length > 0) {
      setPhotoError(`Each photo must be under ${MAX_PHOTO_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    // Validate total count
    const remaining = MAX_PHOTOS - photos.length;
    const accepted = files.slice(0, remaining);

    if (files.length > remaining) {
      setPhotoError(
        `You can add ${remaining} more photo${remaining === 1 ? "" : "s"} (max ${MAX_PHOTOS}).`,
      );
    }

    const newPhotos: PhotoFile[] = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    onPhotosChange([...photos, ...newPhotos]);
    e.target.value = ""; // reset so the same file can be re-selected if removed
  }

  function handleRemovePhoto(index: number) {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(photos[index].preview);
    onPhotosChange(photos.filter((_, i) => i !== index));
    setPhotoError(null);
  }

  // ── Drag-to-reorder ───────────────────────────────────────────────────────

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    const reordered = [...photos];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    onPhotosChange(reordered);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  // ── Video handlers ────────────────────────────────────────────────────────

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setVideoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setVideoError("Only MP4, MOV, and WEBM videos are accepted.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setVideoError(`Video must be under ${MAX_VIDEO_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    onVideoChange(file);
    e.target.value = "";
  }

  function handleRemoveVideo() {
    onVideoChange(null);
    setVideoError(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* ── Photos ───────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[12px] font-medium text-neutral-700">
            Photos
            <span className="text-neutral-400 font-normal ml-1">
              ({photos.length}/{MAX_PHOTOS})
            </span>
          </p>
          {photos.length > 0 && (
            <p className="text-[11px] text-neutral-400">
              Drag to reorder · First photo is the cover
            </p>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {/* Existing photo thumbnails */}
          {photos.map((photo, index) => (
            <div
              key={photo.preview}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border bg-neutral-50 cursor-grab transition-all",
                dragOverIndex === index && dragIndex !== index
                  ? "border-blue-400 scale-105"
                  : "border-neutral-100",
                dragIndex === index && "opacity-40",
              )}
            >
              <Image
                src={photo.preview}
                alt={`Photo ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />

              {/* Cover badge on the first photo */}
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}

              {/* Drag handle */}
              <div className="absolute top-1 left-1 text-white opacity-60">
                <GripVertical className="w-3 h-3" />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}

          {/* Add photo button — hidden when at max */}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-neutral-200 hover:border-blue-300 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1 transition-colors group"
            >
              <ImagePlus className="w-5 h-5 text-neutral-300 group-hover:text-blue-400 transition-colors" />
              <span className="text-[10px] text-neutral-400 group-hover:text-blue-500">
                Add photo
              </span>
            </button>
          )}
        </div>

        {/* Hidden file input — accepts multiple */}
        <input
          ref={photoInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {/* Photo error */}
        {photoError && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-amber-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {photoError}
          </div>
        )}
      </div>

      {/* ── Video ────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[12px] font-medium text-neutral-700 mb-1.5">
          Video
          <span className="text-neutral-400 font-normal ml-1">
            (optional · max {MAX_VIDEO_SIZE_MB}MB)
          </span>
        </p>

        {video ? (
          // Video preview once selected
          <div className="relative flex items-center gap-3 p-3 rounded-lg border border-neutral-100 bg-neutral-50">
            <div className="w-10 h-10 rounded-md bg-neutral-200 flex items-center justify-center shrink-0">
              <VideoIcon className="w-5 h-5 text-neutral-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-neutral-700 truncate">
                {video.name}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {(video.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="p-1 rounded hover:bg-neutral-200 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>
        ) : (
          // Video drop zone
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border-2 border-dashed border-neutral-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors group text-left"
          >
            <VideoIcon className="w-5 h-5 text-neutral-300 group-hover:text-blue-400 shrink-0 transition-colors" />
            <div>
              <p className="text-[12px] text-neutral-500 group-hover:text-blue-600 transition-colors">
                Add a video
              </p>
              <p className="text-[11px] text-neutral-400">MP4, MOV, or WEBM</p>
            </div>
          </button>
        )}

        {/* Hidden video input */}
        <input
          ref={videoInputRef}
          type="file"
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          className="hidden"
          onChange={handleVideoSelect}
        />

        {/* Video error */}
        {videoError && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-amber-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {videoError}
          </div>
        )}
      </div>
    </div>
  );
}
