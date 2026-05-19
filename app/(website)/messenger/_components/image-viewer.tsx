"use client";

import { Download, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface Props {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImageViewer({ src, alt, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30"
      >
        <X className="size-5" />
      </button>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        download
        onClick={(e) => e.stopPropagation()}
        aria-label="Open original"
        className="absolute right-17 top-5 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30"
      >
        <Download className="size-5" />
      </a>

      <div
        className="relative h-full w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt || "Image"}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
