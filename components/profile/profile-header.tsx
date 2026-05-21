"use client";

import { Profile } from "@/hooks/profile/use-profile";
import {
  BadgeCheck,
  BookmarkPlus,
  ChevronDown,
  Eye,
  MoreHorizontal,
  PenLine,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

interface ProfileHeaderProps {
  profile: Profile;
  isOwner: boolean;
  basePath: string; // "/profile" for owner, "/profile/username" for public
}

const TABS = [
  { label: "All", href: "" },
  { label: "About", href: "/about" },
  { label: "Friends", href: "/friends" },
  { label: "Photos", href: "/photos" },
];

export function ProfileHeader({
  profile,
  isOwner,
  basePath,
}: ProfileHeaderProps) {
  const pathname = usePathname();

  const getTabHref = (suffix: string) => `${basePath}${suffix}`;

  const isTabActive = (suffix: string) => {
    const full = getTabHref(suffix);
    if (suffix === "") return pathname === basePath;
    return pathname.startsWith(full);
  };

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const followersCount = profile.followers?.length ?? 0;
  const followingCount = profile.following?.length ?? 0;
  const totalPost = profile.totalPost ?? 0;

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

  const router = useRouter();

  const TogglePublicProfile = () => {
    router.push(`/public/profile/${profile.username}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-visible">
      {/* ── Cover Photo ── */}
      <div className="relative w-full h-52 rounded-t-2xl overflow-hidden bg-slate-800">
        {profile.coverImage?.url ? (
          <Image
            src={profile.coverImage.url}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-900 via-blue-900 to-rose-700" />
        )}
      </div>

      {/* ── Info Row ── */}
      <div className="flex items-end gap-3 px-5 -mt-5 relative z-10">
        {/* Avatar */}
        <div className="relative size-24 rounded-full border-4 border-white overflow-hidden shrink-0 bg-gray-200 shadow-md">
          {profile.profileImage?.url ? (
            <Image
              src={profile.profileImage.url}
              alt={fullName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500 uppercase">
              {profile.firstName?.[0]}
              {profile.lastName?.[0]}
            </div>
          )}
        </div>

        {/* Name + Stats */}
        <div className="pb-2.5 flex-1 min-w-0 ">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
              {fullName}
            </h1>
            <button className="inline-flex items-center gap-1 border border-gray-300 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-gray-500 hover:border-gray-400 transition-colors bg-transparent cursor-pointer">
              <BadgeCheck size={12} className="text-gray-400" />
              Get Verified
            </button>
          </div>
          <p className="text-[12.5px] text-gray-500 mt-0.5">
            {formatCount(followersCount)} Followers &bull;{" "}
            {formatCount(followingCount)} Following &bull; {totalPost} post
          </p>
        </div>

        {/* Owner Actions */}
        {isOwner && (
          <div className="flex items-center gap-2 pb-2.5 shrink-0 ml-auto">
            <button
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-3.5 py-1.75 rounded-lg transition-colors cursor-pointer border-0 whitespace-nowrap"
              onClick={() => router.push("/stories/create")}
            >
              <BookmarkPlus size={14} />
              Add Story
            </button>
            <button
              onClick={() => router.push("/profile/edit")}
              className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-[13px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent whitespace-nowrap"
            >
              <PenLine size={14} />
              Edit Profile
            </button>
            <button
              className="inline-flex items-center justify-center size-8.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-500 rounded-lg transition-colors cursor-pointer bg-transparent"
              onClick={TogglePublicProfile}
            >
              <Eye size={15} />
            </button>
            <button className="inline-flex items-center justify-center size-8.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-500 rounded-lg transition-colors cursor-pointer bg-transparent">
              <Search size={15} />
            </button>
            <button className="inline-flex items-center justify-center size-8.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-500 rounded-lg transition-colors cursor-pointer bg-transparent">
              <MoreHorizontal size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="border-t border-gray-100 px-5 mt-1.5">
        <nav className="flex items-center gap-0.5">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={getTabHref(tab.href)}
              className={[
                "inline-flex items-center gap-1 px-3.5 py-3 text-[13.5px] font-medium border-b-[2.5px] transition-colors whitespace-nowrap no-underline",
                isTabActive(tab.href)
                  ? "text-blue-600 border-b-blue-600 font-semibold"
                  : "text-gray-500 border-b-transparent hover:text-gray-900",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          ))}
          <button className="inline-flex items-center gap-1 px-3.5 py-3 text-[13.5px] font-medium text-gray-500 hover:text-gray-900 border-b-[2.5px] border-b-transparent transition-colors cursor-pointer bg-transparent">
            More <ChevronDown size={12} />
          </button>
        </nav>
      </div>
    </div>
  );
}
