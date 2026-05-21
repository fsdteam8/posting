"use client";

import { useGetPagePosts } from "@/hooks/features/pages/use-get-page-posts";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
  pageId: string;
  accessToken: string;
}

export function PagePhotosSidebar({ pageId, accessToken }: Props) {
  const { data, isLoading } = useGetPagePosts({
    pageId,
    accessToken,
    limit: 12,
  });

  const photos = useMemo(() => {
    const posts = data?.data ?? [];
    const urls: string[] = [];
    for (const post of posts) {
      for (const img of post.images ?? []) {
        if (img?.url) urls.push(img.url);
        if (urls.length >= 6) break;
      }
      if (urls.length >= 6) break;
    }
    return urls;
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">Photos</h2>
        <Link
          href={`/pages/view/${pageId}/photos`}
          className="text-[13px] text-primary font-semibold hover:underline"
        >
          See all photos
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <p className="text-[13px] text-gray-500">No photos yet</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
