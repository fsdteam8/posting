"use client";

import { useGetActiveStories } from "@/hooks/features/feed/story/use-get-active-story";
import { useGetMyStories } from "@/hooks/features/feed/story/use-get-my-stories";

import { DEFAULT_IMAGES } from "@/constants";
import { useGetStoriesByUser } from "@/hooks/features/feed/story/use-get-stories-by-user";
import { StoryGroup } from "@/types/features/feed/story";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { StorySidebar } from "./StorySidebar";
import { StoryViewer } from "./StoryViewer";

interface Props {
  accessToken: string;
  initialStoryId: string;
  currentUser: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export function StoryViewClient({
  accessToken,
  initialStoryId,
  currentUser,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const { data: myStoriesData } = useGetMyStories({ accessToken });
  const { data: activeStoriesData } = useGetActiveStories({ accessToken });
  const { data: userStoriesData } = useGetStoriesByUser({
    accessToken,
    userId,
  });

  console.log("myStoriesData", myStoriesData);

  // Build my story group
  const myGroup: StoryGroup | null = useMemo(() => {
    const stories = myStoriesData?.data ?? [];
    if (!stories.length) return null;
    return {
      user: {
        _id: currentUser._id,
        firstName: currentUser.name,
        lastName: "",
        username: "",
        profileImage: {
          url: currentUser.avatar ?? DEFAULT_IMAGES.user.avatar,
        },
      },
      stories,
    } as StoryGroup;
  }, [myStoriesData, currentUser]);

  // All story groups from active feed
  const allGroups: StoryGroup[] = useMemo(() => {
    return (activeStoriesData?.data ?? []).map((group) => ({
      ...group,
      user: {
        ...group.user,
        profileImage: {
          ...group.user.profileImage,
          url: group.user.profileImage?.url || DEFAULT_IMAGES.user.avatar,
        },
      },
    }));
  }, [activeStoriesData]);

  // Groups from the specific userId provided in query param (for targeted open)
  const targetGroups: StoryGroup[] = useMemo(() => {
    return userStoriesData?.data ?? [];
  }, [userStoriesData]);

  // Build the master ordered list: my group first, then others
  const orderedGroups: StoryGroup[] = useMemo(() => {
    const map = new Map<string, StoryGroup>();

    if (myGroup) map.set(myGroup.user._id, myGroup);

    allGroups.forEach((g) => {
      if (!map.has(g.user._id)) map.set(g.user._id, g);
    });

    targetGroups.forEach((g) => {
      if (!map.has(g.user._id)) map.set(g.user._id, g);
    });

    return Array.from(map.values());
  }, [myGroup, allGroups, targetGroups]);

  // Determine initial active group index
  const initialGroupIndex = useMemo(() => {
    if (!userId) return 0;
    const idx = orderedGroups.findIndex((g) => g.user._id === userId);
    return idx >= 0 ? idx : 0;
  }, [orderedGroups, userId]);

  const [activeGroupIndex, setActiveGroupIndex] = useState(initialGroupIndex);

  // Sync when groups load
  useEffect(() => {
    setActiveGroupIndex(initialGroupIndex);
  }, [initialGroupIndex]);

  const activeGroup = orderedGroups[activeGroupIndex] ?? null;

  const handleSelectGroup = (group: StoryGroup) => {
    const idx = orderedGroups.findIndex((g) => g.user._id === group.user._id);
    if (idx >= 0) setActiveGroupIndex(idx);

    router.replace(
      `/stories/view/${group.stories[0]._id}?userId=${group.user._id}`,
    );
  };

  const handleNextGroup = () => {
    if (activeGroupIndex < orderedGroups.length - 1) {
      const nextGroup = orderedGroups[activeGroupIndex + 1];
      setActiveGroupIndex((i) => i + 1);
      router.replace(
        `/stories/view/${nextGroup.stories[0]._id}?userId=${nextGroup.user._id}`,
      );
    } else {
      router.push("/");
    }
  };

  const handlePrevGroup = () => {
    if (activeGroupIndex > 0) {
      const prevGroup = orderedGroups[activeGroupIndex - 1];
      setActiveGroupIndex((i) => i - 1);
      router.replace(
        `/stories/view/${prevGroup.stories[0]._id}?userId=${prevGroup.user._id}`,
      );
    } else {
      router.push("/");
    }
  };

  const isLoading = !orderedGroups.length;

  return (
    <div className="flex h-screen bg-[#18191a] overflow-hidden">
      {/* Sidebar */}
      <StorySidebar
        myGroups={myGroup ? [myGroup] : []}
        allGroups={allGroups}
        activeUserId={activeGroup?.user._id ?? null}
        currentUserId={currentUser._id}
        onSelectGroup={handleSelectGroup}
      />

      {/* Main viewer area */}
      <main className="flex-1 flex items-center justify-center bg-[#18191a] relative">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
            <p className="text-white/50 text-sm">Loading stories...</p>
          </div>
        ) : activeGroup ? (
          <StoryViewer
            key={activeGroup.user._id} // remount on group change → resets timer
            stories={activeGroup.stories}
            user={activeGroup.user}
            initialStoryId={
              activeGroup.user._id === userId ? initialStoryId : undefined
            }
            accessToken={accessToken}
            currentUserId={currentUser._id}
            onPrevGroup={handlePrevGroup}
            onNextGroup={handleNextGroup}
            hasPrevGroup={activeGroupIndex > 0}
            hasNextGroup={activeGroupIndex < orderedGroups.length - 1}
          />
        ) : (
          <div className="text-white/40 text-sm">No stories available.</div>
        )}
      </main>
    </div>
  );
}
