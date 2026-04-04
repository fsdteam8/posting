"use client";

import { DEFAULT_IMAGES } from "@/constants";
import { StoryGroup } from "@/types/features/feed/story";
import { formatDistanceToNow } from "date-fns";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  myGroups: StoryGroup[];
  allGroups: StoryGroup[];
  activeUserId: string | null;
  currentUserId: string;
  onSelectGroup: (group: StoryGroup) => void;
}

export function StorySidebar({
  myGroups,
  allGroups,
  activeUserId,
  currentUserId,
  onSelectGroup,
}: Props) {
  const router = useRouter();

  const myGroup = myGroups[0] ?? null;

  // Filter out current user from all stories
  const othersGroups = allGroups.filter((g) => g.user._id !== currentUserId);

  const renderAvatar = (group: StoryGroup, size = "w-12 h-12") => {
    const avatar = group.user.profileImage?.url || DEFAULT_IMAGES.user.avatar;
    const isActive = group.user._id === activeUserId;

    return (
      <div
        className={`${size} rounded-full shrink-0 overflow-hidden ${
          isActive
            ? "ring-[3px] ring-[#1877f2] ring-offset-2 ring-offset-white dark:ring-offset-[#242526]"
            : "ring-2 ring-[#1877f2]"
        }`}
      >
        {avatar ? (
          <Image
            src={avatar}
            alt={group.user.firstName}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-lg">
            {group.user.firstName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-90 min-w-75 h-full bg-white dark:bg-[#242526] flex flex-col shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] flex items-center justify-center hover:bg-[#d8dadf] transition-colors"
          >
            <X size={18} className="text-[#050505] dark:text-white" />
          </button>
          <div className="w-10 h-10">
            {/* postin logo placeholder */}
            <div className="w-10 h-10 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
          </div>
        </div>
        <h1 className="text-[22px] font-bold text-[#050505] dark:text-white mt-3 tracking-tight">
          Stories
        </h1>
        <div className="flex gap-3 mt-0.5">
          <button className="text-[13px] text-[#1877f2] font-medium hover:underline">
            Archive
          </button>
          <span className="text-[#65676b]">·</span>
          <button className="text-[13px] text-[#1877f2] font-medium hover:underline">
            Settings
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {/* Your Story */}
        <div className="px-2 mb-2">
          <p className="text-[15px] font-semibold text-[#050505] dark:text-white mb-2">
            Your story
          </p>
          {myGroup ? (
            <button
              onClick={() => onSelectGroup(myGroup)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-left ${
                myGroup.user._id === activeUserId
                  ? "bg-[#e7f3ff] dark:bg-[#263951]"
                  : "hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
              }`}
            >
              {renderAvatar(myGroup)}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#050505] dark:text-white truncate">
                  {myGroup.user.firstName}
                </p>
                <p className="text-[12px] text-[#65676b] dark:text-[#b0b3b8]">
                  {formatDistanceToNow(new Date(myGroup.stories[0].createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => router.push("/stories/create")}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] flex items-center justify-center shrink-0">
                <Plus size={20} className="text-[#1877f2]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#050505] dark:text-white">
                  Add to story
                </p>
                <p className="text-[12px] text-[#65676b]">
                  Share a photo or write something
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#e4e6eb] dark:bg-[#3a3b3c] mx-2 my-3" />

        {/* All stories */}
        {othersGroups.length > 0 && (
          <div className="px-2">
            <p className="text-[15px] font-semibold text-[#050505] dark:text-white mb-2">
              All stories
            </p>
            <div className="flex flex-col gap-0.5">
              {othersGroups.map((group) => {
                const isActive = group.user._id === activeUserId;
                const latestStory = group.stories[0];
                const unseenCount = group.stories.filter(
                  (s) => !s.viewers?.includes(group.user._id),
                ).length;

                return (
                  <button
                    key={group.user._id}
                    onClick={() => onSelectGroup(group)}
                    className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors text-left ${
                      isActive
                        ? "bg-[#e7f3ff] dark:bg-[#263951]"
                        : "hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
                    }`}
                  >
                    {renderAvatar(group)}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#050505] dark:text-white truncate">
                        {group.user.firstName}
                      </p>
                      <p className="text-[12px] text-[#1877f2] dark:text-[#4599ff]">
                        {unseenCount > 0 ? `${unseenCount} new · ` : ""}
                        {formatDistanceToNow(new Date(latestStory.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
