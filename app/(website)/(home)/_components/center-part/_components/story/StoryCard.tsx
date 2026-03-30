import { Story } from "@/types/features/feed/story";
import Image from "next/image";

interface StoryCardProps {
  story: Story & { ownerName?: string; ownerAvatar?: string };
  onClick: () => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const hasMedia = story.media && story.media.length > 0;

  return (
    <button
      onClick={onClick}
      className="relative shrink-0 w-29.5 h-50 rounded-xl overflow-hidden cursor-pointer group focus:outline-none"
      style={{ border: "none", padding: 0 }}
    >
      {/* Background */}
      {hasMedia ? (
        <Image
          src={story.media[0].url}
          alt="story"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="120px"
          priority
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: story.backgroundColor || "#3b5998" }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/60" />

      {/* Avatar */}
      <div className="absolute top-3 left-3">
        <div className="relative w-9 h-9 rounded-full border-4 border-[#1877f2] overflow-hidden bg-gray-300">
          {story.ownerAvatar ? (
            <Image
              src={story.ownerAvatar}
              alt={story.ownerName || "avatar"}
              fill
              className="object-cover"
              sizes="36px"
            />
          ) : (
            <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white text-sm font-bold">
              {story.ownerName?.charAt(0).toUpperCase() ?? "U"}
            </div>
          )}
        </div>
      </div>

      {/* Story text if no media */}
      {!hasMedia && story.text && (
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <p className="text-white text-xs font-semibold text-center leading-tight line-clamp-4">
            {story.text}
          </p>
        </div>
      )}

      {/* Owner name */}
      <div className="absolute bottom-3 left-2 right-2">
        <p className="text-white text-xs font-semibold leading-tight truncate">
          {story.ownerName ?? "Unknown"}
        </p>
      </div>
    </button>
  );
}
