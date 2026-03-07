"use client";

import { useGetGroupAlbums } from "@/hooks/features/groups/api/media/use-get-group-album";
import {
  ImageIcon,
  Images,
  LayoutGrid,
  Plus,
  Search,
  VideoIcon,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { CreateAlbumModal } from "./create-album-modal";
import PhotosTab from "./photos-tab";
import VideosTab from "./video-tab";

type Tab = "photos" | "videos" | "albums";

interface Props {
  groupId: string;
  accessToken: string;
  onCreateAlbum?: () => void;
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-gray-100 animate-pulse rounded-sm"
        />
      ))}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
      <ImageIcon size={40} strokeWidth={1} />
      <p className="text-sm font-medium">No {label} yet</p>
    </div>
  );
}

// ── Albums Tab ─────────────────────────────────────────────────────────────

export function AlbumsTab({
  groupId,
  accessToken,
}: {
  groupId: string;
  accessToken: string;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError } = useGetGroupAlbums({
    groupId,
    accessToken,
    searchQuery: debouncedSearch,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search albums…"
          className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50 placeholder:text-gray-400"
        />
      </div>

      {isLoading ? (
        <SkeletonGrid />
      ) : isError ? (
        <p className="text-xs text-red-500 py-10 text-center">
          Failed to load albums.
        </p>
      ) : !data?.data?.length ? (
        <EmptyState label="albums" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {data.data.map((album) => (
            <div key={album._id} className="group cursor-pointer">
              {/* Cover */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                {album.coverImage?.url ? (
                  <Image
                    src={album.coverImage.url}
                    alt={album.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Images size={28} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="mt-1.5 px-0.5">
                <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
                  {album.title}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {album.photoCount === 0
                    ? "No photos"
                    : `${album.photoCount} ${album.photoCount === 1 ? "photo" : "photos"}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function GroupMediaContainer({ groupId, accessToken }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("photos");
  const [albumModalOpen, setAlbumModalOpen] = useState(false);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "photos", label: "Photos", icon: <ImageIcon size={15} /> },
    { key: "videos", label: "Videos", icon: <VideoIcon size={15} /> },
    { key: "albums", label: "Albums", icon: <LayoutGrid size={15} /> },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        <h2 className="text-lg font-semibold text-gray-900">Media</h2>
        <button
          onClick={() => setAlbumModalOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Create album
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-4 mt-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "photos" && (
          <PhotosTab groupId={groupId} accessToken={accessToken} />
        )}
        {activeTab === "videos" && (
          <VideosTab groupId={groupId} accessToken={accessToken} />
        )}
        {activeTab === "albums" && (
          <AlbumsTab groupId={groupId} accessToken={accessToken} />
        )}
      </div>

      <CreateAlbumModal
        groupId={groupId}
        accessToken={accessToken}
        isOpen={albumModalOpen}
        onClose={() => setAlbumModalOpen(false)}
        onSuccess={() => {
          /* toast, refetch, etc. */
        }}
      />
    </div>
  );
}
