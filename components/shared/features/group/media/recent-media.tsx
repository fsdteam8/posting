"use client";

import { useGetGroupPhotos } from "@/hooks/features/groups/api/media/use-get-group-photos";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoLightbox } from "./photos-tab"; // re-export PhotoLightbox from your photos tab, or co-locate it

// ── Skeleton ─────────────────────────────────────────────────────────────────
function RecentMediaSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 rounded-sm bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RecentMedia({
  groupId,
  accessToken,
  username,
}: {
  groupId: string;
  accessToken: string;
  username: string; // used to build the "See all" redirect URL
}) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data, isLoading, isError } = useGetGroupPhotos({
    groupId,
    accessToken,
  });

  const photos = data?.data ?? [];
  const preview = photos.slice(0, 4); // show max 4 in the sidebar widget

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-bold text-gray-900">Recent media</h3>
      </div>

      {/* Grid */}
      <div className="px-4">
        {isLoading ? (
          <RecentMediaSkeleton />
        ) : isError ? (
          <p className="text-xs text-red-400 py-6 text-center">
            Failed to load media.
          </p>
        ) : preview.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No media yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {preview.map((photo, index) => (
              <div
                key={photo.media._id}
                onClick={() => setLightboxIndex(index)}
                className="group relative h-24 overflow-hidden rounded-sm bg-gray-100 cursor-pointer"
              >
                <Image
                  src={photo.media.url}
                  alt={`Photo by ${photo.author.firstName}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="80px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* See all button */}
      {!isLoading && photos.length > 0 && (
        <button
          onClick={() => router.push(`/groups/view/${username}/media`)}
          className="w-full mt-3 py-3 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-primary/25 border-t border-gray-100 transition-colors cursor-pointer"
        >
          See all
        </button>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
