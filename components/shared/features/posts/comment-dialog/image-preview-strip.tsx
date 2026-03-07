"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo } from "react";

interface ImagePreviewStripProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function ImagePreviewStrip({ files, onRemove }: ImagePreviewStripProps) {
  const objectUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );

  // Revoke all URLs when the files list changes or the component unmounts
  useEffect(() => {
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [objectUrls]);

  if (files.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap px-3 pt-2">
      {objectUrls.map((url, i) => (
        <div key={url} className="relative group w-16 h-16">
          <Image
            src={url}
            alt={`preview ${i + 1}`}
            fill
            unoptimized
            className="rounded-xl object-cover border border-[#e4e6eb]"
          />
          <button
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#606770] text-white flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}
