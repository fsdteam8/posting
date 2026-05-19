"use client";

import { useGetPageById } from "@/hooks/features/pages/use-get-page-by-id";
import Image from "next/image";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=600&fit=crop";

interface Props {
  pageId: string;
  accessToken: string;
}

export function PageCover({ pageId, accessToken }: Props) {
  const { data } = useGetPageById({ pageId, accessToken });

  const cover = data?.data?.coverImage?.url || DEFAULT_COVER;
  const name = data?.data?.name || "Page";

  return (
    <div className="relative w-full h-50 sm:h-65 md:h-80 rounded-xl overflow-hidden bg-gradient-to-r from-amber-50 via-rose-50 to-pink-100">
      <Image
        src={cover}
        alt={name}
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
