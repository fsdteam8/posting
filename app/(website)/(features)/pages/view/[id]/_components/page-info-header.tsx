"use client";

import { Button } from "@/components/ui/button";
import { useStartDirectChat } from "@/hooks/features/messenger/use-start-direct-chat";
import { useFollowPage } from "@/hooks/features/pages/use-follow-page";
import { useGetPageById } from "@/hooks/features/pages/use-get-page-by-id";
import { useUnfollowPage } from "@/hooks/features/pages/use-unfollow-page";
import { useProfile } from "@/hooks/profile/use-profile";
import { Camera, Check, Loader2, MessageCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Props {
  pageId: string;
  accessToken: string;
}

type PopulatedAdmin = {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
};

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function PageInfoHeader({ pageId, accessToken }: Props) {
  const { data, isLoading } = useGetPageById({ pageId, accessToken });
  const { data: profile } = useProfile(accessToken);

  const { mutate: follow, isPending: isFollowing } = useFollowPage({
    accessToken,
    pageId,
  });

  const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowPage({
    accessToken,
    pageId,
  });

  const { startChat, isStarting } = useStartDirectChat({ accessToken });

  if (isLoading || !data?.data) {
    return (
      <div className="relative px-6 pb-6">
        <div className="flex items-end gap-4 -mt-12">
          <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse border-4 border-white" />
          <div className="flex-1 pb-2 space-y-2">
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  const page = data.data;
  const isFollowingPage = page.currentUserMeta?.isFollowing ?? false;
  const isPending = isFollowing || isUnfollowing;

  // Pages aren't direct participants — messages open a chat with the page's
  // primary admin (createdBy / first admin).
  const admins = (page.admins ?? []) as Array<string | PopulatedAdmin>;
  const primaryAdminId = admins
    .map((a) => (typeof a === "string" ? a : a._id))
    .find(Boolean);

  const isSelfAdmin = profile
    ? admins.some((a) => (typeof a === "string" ? a : a._id) === profile._id)
    : false;

  function handleFollowToggle() {
    if (isFollowingPage) {
      unfollow();
    } else {
      follow();
    }
  }

  function handleMessage() {
    if (!primaryAdminId) {
      toast.error("This page can't receive messages right now.");
      return;
    }
    if (isSelfAdmin) {
      toast.info("You manage this page — you can't message yourself.");
      return;
    }
    startChat(primaryAdminId);
  }

  const messageDisabled = isStarting || isSelfAdmin || !primaryAdminId;

  return (
    <div className="relative px-6 pb-4">
      <div className="flex items-end gap-4 -mt-12">
        {/* Profile image */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-linear-to-br from-purple-500 to-blue-500">
            {page.profileImage?.url ? (
              <Image
                src={page.profileImage.url}
                alt={page.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                {page.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50">
            <Camera size={14} className="text-gray-700" />
          </button>
        </div>

        {/* Name + stats */}
        <div className="flex-1 min-w-0 pb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight truncate">
            {page.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatFollowers(page.followersCount)} Followers
            {page.followersCount > 0 ? " · " : " · "}
            {formatFollowers(0)} Following
          </p>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-end gap-2 mt-3">
        <Button
          variant={isFollowingPage ? "secondary" : "default"}
          size="sm"
          disabled={isPending}
          onClick={handleFollowToggle}
          className="gap-1.5 px-5 py-2 rounded-lg font-semibold"
        >
          <Check className="w-4 h-4" />
          {isPending ? "..." : isFollowingPage ? "Following" : "Follow"}
        </Button>
        {!isSelfAdmin && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={messageDisabled}
            onClick={handleMessage}
            className="gap-1.5 px-5 py-2 rounded-lg font-semibold border-primary text-primary hover:bg-primary/5 disabled:opacity-60"
          >
            {isStarting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            Message
          </Button>
        )}
      </div>
    </div>
  );
}
