"use client";

import { useGetGroupPhotos } from "@/hooks/features/groups/api/media/use-get-group-photos";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoLightbox } from "./photos-tab";

function RecentMediaSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 rounded-sm bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function RecentMedia({
  groupId,
  accessToken,
  username,
}: {
  groupId: string;
  accessToken: string;
  username: string;
}) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data, isLoading, isError } = useGetGroupPhotos({
    groupId,
    accessToken,
  });

  const photos = data?.data ?? [];
  const preview = photos.slice(0, 4);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-bold text-foreground">Recent media</h3>
      </div>

      {/* Grid */}
      <div className="px-4">
        {isLoading ? (
          <RecentMediaSkeleton />
        ) : isError ? (
          <p className="text-xs text-red-400 dark:text-red-500 py-6 text-center">
            Failed to load media.
          </p>
        ) : preview.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">
            No media yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {preview.map((photo, index) => (
              <div
                key={photo.media._id}
                onClick={() => setLightboxIndex(index)}
                className="group relative h-24 overflow-hidden rounded-sm bg-muted cursor-pointer"
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
          className="w-full mt-3 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-primary/10 border-t border-border transition-colors cursor-pointer"
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
