"use client";

import { GroupPost } from "@/types/features/posts";
import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PostMediaProps {
  post: GroupPost;
}

export const PostMedia = ({ post }: PostMediaProps) => {
  const { postType, images, video } = post;
  const [videoPlaying, setVideoPlaying] = useState(false);

  if (postType === "video" && video?.url) {
    return (
      <div className="relative bg-black aspect-video overflow-hidden">
        {!videoPlaying ? (
          <>
            {video.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt="video thumbnail"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-b from-[#2a1a1a] to-[#1a1a2a]" />
            )}
            <button
              onClick={() => setVideoPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group"
            >
              <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/80 transition-colors">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
              {video.duration > 0 && (
                <span className="absolute bottom-2 right-3 text-white text-[12px] font-medium bg-black/60 px-1.5 py-0.5 rounded">
                  {Math.floor(video.duration / 60)}:
                  {String(Math.floor(video.duration % 60)).padStart(2, "0")}
                </span>
              )}
            </button>
          </>
        ) : (
          <video
            src={video.url}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        )}
      </div>
    );
  }

  if (postType === "image" && images?.length > 0) {
    const count = images.length;

    // Single image
    if (count === 1) {
      return (
        <div className="relative w-full max-h-125 overflow-hidden bg-black">
          <Image
            src={images[0]}
            alt="post image"
            width={800}
            height={500}
            className="w-full object-contain max-h-125"
          />
        </div>
      );
    }

    // Two images
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden bg-black"
            >
              <Image
                src={url}
                alt={`image ${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      );
    }

    // Three images
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          <div className="relative aspect-square overflow-hidden bg-black row-span-2 col-span-1">
            <Image
              src={images[0]}
              alt="image 1"
              fill
              className="object-cover"
            />
          </div>
          {images.slice(1).map((url, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden bg-black"
            >
              <Image
                src={url}
                alt={`image ${i + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      );
    }

    // Four or more
    const shown = images.slice(0, 4);
    const extra = count - 4;
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {shown.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden bg-black"
          >
            <Image
              src={url}
              alt={`image ${i + 1}`}
              fill
              className="object-cover"
            />
            {i === 3 && extra > 0 && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{extra}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
};
