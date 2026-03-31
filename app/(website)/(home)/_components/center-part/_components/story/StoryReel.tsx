"use client";

import { useEffect, useRef, useState } from "react";

import { useGetActiveStories } from "@/hooks/features/feed/story/use-get-active-story";
import { useGetMyStories } from "@/hooks/features/feed/story/use-get-my-stories";
import { Story, StoryGroup } from "@/types/features/feed/story";
import { useRouter } from "nextjs-toploader/app";
import { CreateStoryCard } from "./CreateStoryCard";
import { StoryCard } from "./StoryCard";

interface StoryReelProps {
  accessToken: string;
  currentUser?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  onCreateStory?: () => void;
  onViewStory?: (story: Story) => void;
}

const CARD_WIDTH = 118; // px
const CARD_GAP = 12; // px
const SCROLL_AMOUNT = (CARD_WIDTH + CARD_GAP) * 3; // scroll 3 cards at a time

export function StoryReel({ accessToken, currentUser }: StoryReelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const router = useRouter();

  const { data: myStoriesData, isLoading: myStoriesLoading } = useGetMyStories({
    accessToken,
  });
  const { data: activeStoriesData, isLoading: activeStoriesLoading } =
    useGetActiveStories({ accessToken });

  const myStories = myStoriesData?.data ?? [];
  const activeStories: StoryGroup[] = activeStoriesData?.data ?? [];

  // Merge: show logged-in user's latest story first, then others (excluding current user's)
  const mergedStories: (Story & {
    ownerName?: string;
    ownerAvatar?: string;
  })[] = [];

  if (myStories.length > 0) {
    mergedStories.push({
      ...myStories[0],
      ownerName: currentUser?.name ?? "You",
      ownerAvatar: currentUser?.avatar,
    });
  }

  activeStories.forEach((item) => {
    // Skip current user's stories
    if (item.user._id === currentUser?._id) return;

    // Get first (latest) story
    const firstStory = item.stories?.[0];
    if (!firstStory) return;

    mergedStories.push({
      ...firstStory,
      ownerName: `${item.user.firstName ?? ""}`.trim() || "Unknown",
      ownerAvatar: item.user.profileImage?.url || "",
    });
  });

  const isLoading = myStoriesLoading || activeStoriesLoading;

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [mergedStories.length]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  const handleViewStory = (story: Story, ownerId: string) => {
    // storyId  → the specific story clicked
    // on       → the owner/user whose story group to open
    router.push(`/stories/view/${story._id}?userId=${ownerId}`);
  };

  return (
    <div className="relative w-full select-none">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-[#3a3b3c] shadow-md border border-[#e4e6eb] dark:border-[#3a3b3c] flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#4a4b4c] transition-colors duration-150 focus:outline-none"
          aria-label="Scroll left"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8l4-4"
              stroke="#050505"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Create Story card — always first */}
        <CreateStoryCard
          userAvatar={currentUser?.avatar}
          onClick={() => router.push("/stories/create")}
        />

        {/* Skeleton loading */}
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-29.5 h-50 rounded-xl bg-[#e4e6eb] dark:bg-[#3a3b3c] animate-pulse"
            />
          ))}

        {/* Story cards */}
        {!isLoading &&
          mergedStories.map((story, i) => (
            <StoryCard
              key={i}
              story={story}
              onClick={() => handleViewStory(story, story.user._id)}
            />
          ))}

        {/* Empty state — no stories yet */}
        {!isLoading && mergedStories.length === 0 && (
          <div className="shrink-0 w-29.5 h-50 rounded-xl border-2 border-dashed border-[#e4e6eb] dark:border-[#3a3b3c] flex items-center justify-center">
            <p className="text-[#65676b] dark:text-[#b0b3b8] text-[10px] text-center px-2 font-medium">
              No stories yet
            </p>
          </div>
        )}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-[#3a3b3c] shadow-md border border-[#e4e6eb] dark:border-[#3a3b3c] flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#4a4b4c] transition-colors duration-150 focus:outline-none"
          aria-label="Scroll right"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="#050505"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
