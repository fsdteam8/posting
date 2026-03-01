"use client";

import { cn } from "@/lib/utils";
import { Film, ImageIcon, Plus, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaFile {
  id: string;
  file: File;
  url: string; // object URL for preview
  type: "image" | "video";
}

interface MediaUploaderProps {
  value: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  maxFiles?: number; // default 10
  maxSizeMB?: number; // default 50
  draggerOpen?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

function detectType(file: File): "image" | "video" {
  return file.type.startsWith("video/") ? "video" : "image";
}

function toMediaFile(file: File): MediaFile {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    url: URL.createObjectURL(file),
    type: detectType(file),
  };
}

// ─── Single preview ───────────────────────────────────────────────────────────

const SinglePreview = ({
  item,
  onRemove,
  onAddMore,
  canAddMore,
}: {
  item: MediaFile;
  onRemove: (id: string) => void;
  onAddMore: () => void;
  canAddMore: boolean;
}) => (
  <div className="relative w-full rounded-xl overflow-hidden bg-black group">
    {item.type === "video" ? (
      <video
        src={item.url}
        controls
        className="w-full max-h-85 object-contain"
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt="preview"
        className="w-full max-h-85 object-contain"
      />
    )}

    {/* Overlay controls */}
    <button
      type="button"
      onClick={() => onRemove(item.id)}
      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
    >
      <X className="w-4 h-4" />
    </button>

    {canAddMore && (
      <button
        type="button"
        onClick={onAddMore}
        className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white/90 hover:bg-white text-fb-text text-[12px] font-semibold px-3 py-1.5 rounded-full shadow transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add more
      </button>
    )}
  </div>
);

// ─── Grid preview layouts ─────────────────────────────────────────────────────

const MediaThumb = ({
  item,
  onRemove,
  className,
  overlay,
}: {
  item: MediaFile;
  onRemove: (id: string) => void;
  className?: string;
  overlay?: React.ReactNode;
}) => (
  <div
    className={cn(
      "relative group overflow-hidden bg-black rounded-lg",
      className,
    )}
  >
    {item.type === "video" ? (
      <video src={item.url} className="w-full h-full object-cover" muted />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.url} alt="" className="w-full h-full object-cover" />
    )}

    {/* Video badge */}
    {item.type === "video" && (
      <div className="absolute bottom-1.5 left-1.5 bg-black/60 rounded px-1.5 py-0.5 flex items-center gap-1">
        <Film className="w-3 h-3 text-white" />
        <span className="text-[10px] text-white font-medium">Video</span>
      </div>
    )}

    {/* Remove btn */}
    <button
      type="button"
      onClick={() => onRemove(item.id)}
      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <X className="w-3.5 h-3.5" />
    </button>

    {/* Count overlay (e.g. "+3") */}
    {overlay}
  </div>
);

const MultiPreview = ({
  items,
  onRemove,
  onAddMore,
  canAddMore,
  total,
}: {
  items: MediaFile[];
  onRemove: (id: string) => void;
  onAddMore: () => void;
  canAddMore: boolean;
  total: number;
}) => {
  const shown = items.slice(0, 5);
  const extra = total - 5;

  // Layout variants based on count
  const gridClass =
    {
      2: "grid grid-cols-2 gap-1",
      3: "grid grid-cols-2 gap-1",
      4: "grid grid-cols-2 gap-1",
      5: "grid grid-cols-2 gap-1",
    }[Math.min(shown.length, 5) as 2 | 3 | 4 | 5] ?? "grid grid-cols-2 gap-1";

  return (
    <div className="space-y-1">
      <div className={gridClass}>
        {shown.length === 2 &&
          shown.map((item) => (
            <MediaThumb
              key={item.id}
              item={item}
              onRemove={onRemove}
              className="h-44"
            />
          ))}

        {shown.length === 3 && (
          <>
            <MediaThumb
              item={shown[0]}
              onRemove={onRemove}
              className="h-52 col-span-2"
            />
            <MediaThumb item={shown[1]} onRemove={onRemove} className="h-36" />
            <MediaThumb item={shown[2]} onRemove={onRemove} className="h-36" />
          </>
        )}

        {shown.length === 4 && (
          <>
            <MediaThumb
              item={shown[0]}
              onRemove={onRemove}
              className="h-44 col-span-2"
            />
            <MediaThumb item={shown[1]} onRemove={onRemove} className="h-36" />
            <MediaThumb item={shown[2]} onRemove={onRemove} className="h-36" />
            <MediaThumb
              item={shown[3]}
              onRemove={onRemove}
              className="h-36 col-span-2"
            />
          </>
        )}

        {shown.length >= 5 && (
          <>
            <MediaThumb
              item={shown[0]}
              onRemove={onRemove}
              className="h-44 col-span-2"
            />
            <MediaThumb item={shown[1]} onRemove={onRemove} className="h-36" />
            <MediaThumb item={shown[2]} onRemove={onRemove} className="h-36" />
            <MediaThumb item={shown[3]} onRemove={onRemove} className="h-36" />
            <MediaThumb
              item={shown[4]}
              onRemove={onRemove}
              className="h-36"
              overlay={
                extra > 0 ? (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-lg">
                    <span className="text-white text-2xl font-bold">
                      +{extra}
                    </span>
                  </div>
                ) : undefined
              }
            />
          </>
        )}
      </div>

      {/* Add more row */}
      {canAddMore && (
        <button
          type="button"
          onClick={onAddMore}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-gray-300 hover:bg-gray-50 text-[12px] font-semibold text-fb-text-secondary transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add more photos/videos
        </button>
      )}
    </div>
  );
};

// ─── Drop zone (empty state) ──────────────────────────────────────────────────

const DropZone = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  inputRef,
}: {
  onFiles: (files: File[]) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) => (
  <div
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    onClick={() => inputRef.current?.click()}
    className={cn(
      "w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
      isDragging
        ? "border-primary bg-blue-50"
        : "border-gray-300 bg-gray-50 hover:bg-gray-100",
    )}
  >
    <div className="flex items-center gap-2 text-fb-text-secondary">
      <ImageIcon className="w-5 h-5" />
      <Film className="w-5 h-5" />
    </div>
    <p className="text-[13px] font-semibold text-fb-text-secondary">
      Add photos/videos
    </p>
    <p className="text-[11px] text-gray-400">or drag and drop</p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const MediaUploader = ({
  value,
  onChange,
  maxFiles = 10,
  maxSizeMB = 50,
  draggerOpen = true,
}: MediaUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const canAddMore = value.length < maxFiles;

  const processFiles = useCallback(
    (raw: File[]) => {
      const errs: string[] = [];
      const valid: MediaFile[] = [];

      raw.forEach((file) => {
        if (!ACCEPTED.includes(file.type)) {
          errs.push(`"${file.name}" is not a supported format.`);
          return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          errs.push(`"${file.name}" exceeds ${maxSizeMB}MB.`);
          return;
        }
        valid.push(toMediaFile(file));
      });

      setErrors(errs);

      const next = [...value, ...valid].slice(0, maxFiles);
      onChange(next);
    },
    [value, onChange, maxFiles, maxSizeMB],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    processFiles(files);
    e.target.value = ""; // reset so same file can be re-added
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleRemove = (id: string) => {
    const removed = value.find((f) => f.id === id);
    if (removed) URL.revokeObjectURL(removed.url);
    onChange(value.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-2">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Empty state */}
      {value.length === 0 && draggerOpen && (
        <DropZone
          onFiles={processFiles}
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          inputRef={inputRef}
        />
      )}

      {/* Single preview */}
      {value.length === 1 && (
        <SinglePreview
          item={value[0]}
          onRemove={handleRemove}
          onAddMore={() => inputRef.current?.click()}
          canAddMore={canAddMore}
        />
      )}

      {/* Multi preview */}
      {value.length > 1 && (
        <MultiPreview
          items={value}
          onRemove={handleRemove}
          onAddMore={() => inputRef.current?.click()}
          canAddMore={canAddMore}
          total={value.length}
        />
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-0.5">
          {errors.map((e, i) => (
            <p key={i} className="text-[11px] text-red-500">
              {e}
            </p>
          ))}
        </div>
      )}

      {/* File count indicator */}
      {value.length > 0 && (
        <p className="text-[11px] text-fb-text-secondary text-right">
          {value.length}/{maxFiles} files
        </p>
      )}
    </div>
  );
};
