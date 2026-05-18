"use client";

import { ProfileSidebar } from "@/components/profile/sidebar/profile-sidebar";
import GroupPostCard from "@/components/shared/features/posts/post-card";
import { useGetTimelinePosts } from "@/hooks/posts/use-get-timeline-posts";
import { useGetProfileByUsername } from "@/hooks/profile/use-get-profile-by-username";

interface PublicProfilePageClientProps {
  username: string;
  accessToken: string;
  loggedInUserId: string;
}

export default function PublicProfilePageClient({
  username,
  accessToken,
  loggedInUserId,
}: PublicProfilePageClientProps) {
  const { data: profile, isLoading: isProfileLoading } =
    useGetProfileByUsername({ username, accessToken });

  const {
    data,
    isLoading: isPostsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTimelinePosts({
    accessToken,
    targetUserId: profile?._id ?? "",
  });

  const posts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="flex gap-4 items-start w-full">
      {/* ── Left sidebar — sticky ── */}
      <aside className="w-85 shrink-0 sticky top-4">
        {isProfileLoading || !profile ? (
          <SidebarSkeleton />
        ) : (
          <ProfileSidebar
            profile={profile}
            isOwner={false}
            basePath={`/profile/${username}`}
            accessToken={accessToken}
          />
        )}
      </aside>

      {/* ── Right feed — scrollable ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Feed header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-[15px] font-bold text-gray-900">Posts</h2>
          </div>

          {/* Loading posts */}
          {isPostsLoading && (
            <div className="flex flex-col gap-3 p-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-2xl bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[400%_100%] animate-[shimmer_1.4s_infinite]"
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isPostsLoading && posts.length === 0 && (
            <p className="text-[13px] text-gray-400 italic px-4 pb-4">
              No posts yet.
            </p>
          )}

          {/* Posts */}
          {posts.length > 0 && (
            <div className="flex flex-col divide-y divide-gray-50">
              {posts.map((post) => (
                <GroupPostCard
                  key={post._id}
                  post={post}
                  accessToken={accessToken}
                  loggedInUserId={loggedInUserId}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasNextPage && (
            <div className="p-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2 text-[13px] text-blue-500 font-medium hover:underline cursor-pointer bg-transparent border-0 disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading..." : "Load more posts"}
              </button>
            </div>
          )}
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
