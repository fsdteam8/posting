"use client";

import Image from "next/image";
import Link from "next/link";

interface Photo {
  url: string;
  public_id: string;
}

interface PhotosWidgetProps {
  photos: Photo[];
  basePath: string; // "/profile" or "/profile/username"
}

export function PhotosWidget({ photos, basePath }: PhotosWidgetProps) {
  const displayed = photos.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">Photos</h3>
        <Link
          href={`${basePath}/photos`}
          className="text-[12.5px] text-blue-500 hover:underline no-underline font-medium"
        >
          See all photos
        </Link>
      </div>

      {displayed.length === 0 ? (
        <p className="text-[13px] text-gray-400 italic">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {displayed.map((photo, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
            >
              <Image
                src={photo.url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
