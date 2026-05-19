"use client";

import { DEFAULT_IMAGES } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface Props {
  src?: string | null;
  alt: string;
  sizes?: string;
  isGroup?: boolean;
  className?: string;
  rounded?: boolean;
}

/**
 * Fill-mode image with a default-placeholder fallback (no src OR onError).
 * Place inside a sized, `relative` wrapper.
 */
export function Avatar(props: Props) {
  const fallback = props.isGroup
    ? DEFAULT_IMAGES.group.cover
    : DEFAULT_IMAGES.user.avatar;
  const initial =
    props.src && props.src.trim() ? props.src : fallback;
  // Re-mount on src change so the fallback state resets cleanly.
  return <AvatarImg {...props} key={initial} initial={initial} fallback={fallback} />;
}

function AvatarImg({
  alt,
  sizes = "48px",
  className,
  rounded = true,
  initial,
  fallback,
}: Props & { initial: string; fallback: string }) {
  const [imgSrc, setImgSrc] = useState<string>(initial);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes={sizes}
      onError={() => setImgSrc(fallback)}
      className={cn("object-cover", rounded && "rounded-full", className)}
    />
  );
}
