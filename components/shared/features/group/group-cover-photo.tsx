"use client";

import { DEFAULT_IMAGES } from "@/constants";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { FastAverageColor } from "fast-average-color";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ErrorScreen from "../../screens/error-screen";

interface Props {
  username: string;
  accessToken: string;
}

export default function GroupCoverPhoto({ username, accessToken }: Props) {
  const DEFAULT_BG = "rgba(90,52,158,1)";
  const [bgColor, setBgColor] = useState<string>(DEFAULT_BG);

  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetSingleGroup({ username, accessToken });

  const coverImage = useMemo(() => {
    if (!data?.success) return undefined;
    return data.data?.coverImage?.url || DEFAULT_IMAGES.group.cover;
  }, [data]);

  useEffect(() => {
    if (!coverImage) {
      return;
    }

    const fac = new FastAverageColor();
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = coverImage;

    img.onload = () => {
      const { value } = fac.getColor(img);
      const [r, g, b] = value;

      // Hard / strong color
      const darken = 0.6;
      const newR = Math.round(r * darken);
      const newG = Math.round(g * darken);
      const newB = Math.round(b * darken);

      setBgColor(`rgba(${newR}, ${newG}, ${newB}, 1)`);
      fac.destroy();
    };

    img.onerror = () => {
      setBgColor(DEFAULT_BG);
      fac.destroy();
    };

    return () => fac.destroy();
  }, [coverImage]);

  if (isLoading) return null;

  if (isError) {
    return (
      <ErrorScreen
        message={(error as Error)?.message ?? "Something went wrong"}
        isRefetching={isRefetching}
        onRetry={refetch}
      />
    );
  }

  if (!data?.success) return null;

  const group = data.data;
  const admin = group.admins?.[0];

  return (
    <div className="relative w-full h-50 sm:h-65 md:h-87.5 overflow-hidden bg-linear-to-b from-[#6a3cb5] to-[#4a2a8a]">
      {/* Only render image if exists */}
      {coverImage && (
        <Image
          src={coverImage}
          alt={group.name}
          fill
          className="object-cover"
          priority
        />
      )}

      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-1.5"
        style={{ backgroundColor: bgColor }}
      >
        <p className="text-xs sm:text-sm font-normal text-white">
          Group by{" "}
          <span className="font-semibold">{admin?.firstName ?? "Admin"}</span>
        </p>
      </div>
    </div>
  );
}
