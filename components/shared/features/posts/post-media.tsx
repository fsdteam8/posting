"use client";

import { Post, VideoInfo } from "@/types/features/posts";
import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PostMediaProps {
  post: Post;
}

const MoreOverlay = ({ count }: { count: number }) => (
  <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
    <span className="text-white text-2xl font-bold">+{count}</span>
  </div>
);

const VideoCell = ({
  video,
  className,
  overlay,
}: {
  video: VideoInfo;
  className?: string;
  overlay?: React.ReactNode;
}) => {
  const [playing, setPlaying] = useState(false);

  const duration =
    video.duration > 0
      ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, "0")}`
      : null;

  return (
    <div className={`relative bg-black overflow-hidden ${className ?? ""}`}>
      {playing ? (
        <video
          src={video.url}
          controls
          autoPlay
          className="w-full h-full object-contain"
        />
      ) : (
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
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/80 transition-colors">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </button>
          {duration && (
            <span className="absolute bottom-2 right-2 text-white text-[11px] font-medium bg-black/60 px-1.5 py-0.5 rounded pointer-events-none">
              {duration}
            </span>
          )}
          {overlay}
        </>
      )}
    </div>
  );
};

const ImageCell = ({
  url,
  alt,
  className,
  overlay,
}: {
  url: string;
  alt: string;
  className?: string;
  overlay?: React.ReactNode;
}) => (
  <div className={`relative bg-black overflow-hidden ${className ?? ""}`}>
    <Image src={url} alt={alt} fill className="object-cover" />
    {overlay}
  </div>
);

const VideoGrid = ({ videos }: { videos: VideoInfo[] }) => {
  const count = videos.length;
  const shown = videos.slice(0, 4);
  const extra = count - 4;

  if (count === 1)
    return <VideoCell video={videos[0]} className="aspect-video w-full" />;

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {videos.map((v) => (
          <VideoCell key={v.id} video={v} className="aspect-video" />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        <VideoCell video={videos[0]} className="row-span-2 min-h-70" />
        <VideoCell video={videos[1]} className="aspect-square" />
        <VideoCell video={videos[2]} className="aspect-square" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5">
      {shown.map((v, i) => (
        <VideoCell
          key={v.id}
          video={v}
          className="aspect-square"
          overlay={
            i === 3 && extra > 0 ? <MoreOverlay count={extra} /> : undefined
          }
        />
      ))}
    </div>
  );
};

const ImageGrid = ({ images }: { images: string[] }) => {
  const count = images.length;

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

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {images.map((url, i) => (
          <ImageCell
            key={i}
            url={url}
            alt={`image ${i + 1}`}
            className="aspect-square"
          />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        <ImageCell
          url={images[0]}
          alt="image 1"
          className="row-span-2 min-h-70"
        />
        {images.slice(1).map((url, i) => (
          <ImageCell
            key={i}
            url={url}
            alt={`image ${i + 2}`}
            className="aspect-square"
          />
        ))}
      </div>
    );
  }

  const shown = images.slice(0, 4);
  const extra = count - 4;
  return (
    <div className="grid grid-cols-2 gap-0.5">
      {shown.map((url, i) => (
        <ImageCell
          key={i}
          url={url}
          alt={`image ${i + 1}`}
          className="aspect-square"
          overlay={
            i === 3 && extra > 0 ? <MoreOverlay count={extra} /> : undefined
          }
        />
      ))}
    </div>
  );
};

type MediaItem =
  | { kind: "image"; url: string }
  | { kind: "video"; video: VideoInfo };

const MixedGrid = ({ items }: { items: MediaItem[] }) => {
  const shown = items.slice(0, 4);
  const extra = items.length - 4;

  const renderCell = (item: MediaItem, i: number, className: string) => {
    const isLast = i === shown.length - 1 && extra > 0;
    const overlay = isLast ? <MoreOverlay count={extra} /> : undefined;

    if (item.kind === "image") {
      return (
        <ImageCell
          key={`m-${i}`}
          url={item.url}
          alt={`media ${i + 1}`}
          className={className}
          overlay={overlay}
        />
      );
    }
    return (
      <VideoCell
        key={`m-${i}`}
        video={item.video}
        className={className}
        overlay={overlay}
      />
    );
  };

  if (shown.length === 1)
    return (
      <div className="aspect-video">
        {renderCell(shown[0], 0, "w-full h-full")}
      </div>
    );

  if (shown.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {shown.map((item, i) => renderCell(item, i, "aspect-square"))}
      </div>
    );
  }

  if (shown.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {renderCell(shown[0], 0, "row-span-2 min-h-[280px]")}
        {renderCell(shown[1], 1, "aspect-square")}
        {renderCell(shown[2], 2, "aspect-square")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5">
      {shown.map((item, i) => renderCell(item, i, "aspect-square"))}
    </div>
  );
};

// post-media.tsx
export const PostMedia = ({ post }: PostMediaProps) => {
  const { postType, images, video, videos } = post;

  // Extract URL strings from image objects
  const imageUrls = (images ?? []).map((img) => img.url).filter(Boolean);

  const videoList: VideoInfo[] =
    videos && videos.length > 0
      ? videos
      : video?.url
        ? [
            {
              id: "legacy",
              url: video.url,
              public_id: video.public_id,
              thumbnail: video.thumbnail,
              duration: video.duration,
            },
          ]
        : [];

  const hasImages = imageUrls.length > 0;
  const hasVideos = videoList.length > 0;

  if (hasImages && hasVideos) {
    const items: MediaItem[] = [
      ...imageUrls.map((url) => ({ kind: "image" as const, url })),
      ...videoList.map((v) => ({ kind: "video" as const, video: v })),
    ];
    return <MixedGrid items={items} />;
  }

  if (postType === "video" && hasVideos)
    return <VideoGrid videos={videoList} />;
  if (postType === "image" && hasImages)
    return <ImageGrid images={imageUrls} />;

  return null;
};
