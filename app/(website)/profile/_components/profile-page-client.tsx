"use client";

import TimelinePostContainer from "@/components/profile/posts/timeline-post-container";
import { ProfileSidebar } from "@/components/profile/sidebar/profile-sidebar";
import FeedPostModalContainer from "@/components/shared/features/post-modal/feed-post-modal-container";
import { useProfile } from "@/hooks/profile/use-profile";

interface ProfilePageClientProps {
  accessToken: string;
  userId: string;
}

export function ProfilePageClient({
  accessToken,
  userId,
}: ProfilePageClientProps) {
  const { data: profile, isLoading } = useProfile(accessToken);

  return (
    <div className="flex gap-4 items-start w-full">
      {/* ── Left sidebar — sticky, does NOT scroll ── */}
      <aside className="w-85 shrink-0 sticky top-4">
        {isLoading || !profile ? (
          <SidebarSkeleton />
        ) : (
          <ProfileSidebar
            profile={profile}
            isOwner={true}
            basePath="/profile"
            accessToken={accessToken}
          />
        )}
      </aside>

      {/* ── Right feed — scrollable ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <FeedPostModalContainer accessToken={accessToken} />

        <div className=" rounded-2xl  overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-[15px] font-bold text-gray-900">Feed</h2>
          </div>
          <div className="px-1 pb-1">
            <TimelinePostContainer
              accessToken={accessToken}
              targetUserId={userId}
              loggedinUser={userId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[120, 180, 140, 160, 100].map((h, i) => (
        <div
          key={i}
          className="rounded-2xl bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[400%_100%] animate-[shimmer_1.4s_infinite]"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}
