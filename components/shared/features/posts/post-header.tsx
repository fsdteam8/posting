"use client";

import { Post } from "@/types/features/posts";
import { formatDistanceToNow } from "date-fns";
import { Globe, Lock, Users } from "lucide-react";
import Image from "next/image";
import {
  ACTIVITY_CATEGORIES,
  FEELINGS,
} from "../post-modal/feeling-activity-picker";
import PostHeaderAction from "./post-header-action";

const visibilityIcon = {
  public: <Globe className="w-3 h-3 text-fb-text-secondary" />,
  "only me": <Lock className="w-3 h-3 text-fb-text-secondary" />,
  friends: <Users className="w-3 h-3 text-fb-text-secondary" />,
  "friends of friends": <Users className="w-3 h-3 text-fb-text-secondary" />,
};

interface PostHeaderProps {
  post: Post;
  accessToken: string;
  groupId: string;
  loggedinUserId: string;
}

export const PostHeader = ({
  post,
  accessToken,
  groupId,
  loggedinUserId,
}: PostHeaderProps) => {
  const { author, createdAt, visibility, feeling, activity } = post;

  const avatarUrl =
    author.profileImage?.url ||
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${author.firstName}&backgroundColor=b6e3f4`;

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  // Look up emoji from hardcoded data
  const feelingData = feeling
    ? FEELINGS.find((f) => f.label === feeling)
    : null;

  const activityData = activity
    ? ACTIVITY_CATEGORIES.flatMap((c) => c.items).find(
        (a) => a.label === activity,
      )
    : null;

  const activityCategory = activityData
    ? ACTIVITY_CATEGORIES.find((c) => c.id === activityData.category)
    : null;

  // Build the feeling/activity line
  const feelingLine = feelingData
    ? { emoji: feelingData.emoji, text: `is feeling ${feelingData.label}` }
    : activityData
      ? {
          emoji: activityData.emoji,
          text: `is ${activityCategory?.label ?? ""} ${activityData.label}`,
        }
      : null;

  return (
    <div className="flex items-start justify-between px-4 pt-3 pb-2">
      <div className="flex items-start gap-2">
        <Image
          src={avatarUrl}
          alt={`${author.firstName} ${author.lastName}`}
          width={40}
          height={40}
          className="rounded-full object-cover shrink-0"
        />
        <div>
          <div className="flex items-center gap-1 flex-wrap leading-tight">
            <p className="text-[15px] font-semibold text-fb-text-primary">
              {author.firstName} {author.lastName}
            </p>
            {feelingLine && (
              <div className="flex items-center gap-1">
                <span className="text-[14px] text-fb-text-secondary">
                  {feelingLine.text}
                </span>
                <span className="text-[14px] leading-none">
                  {feelingLine.emoji}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[12px] text-fb-text-secondary">
              {timeAgo}
            </span>
            <span className="text-[12px] text-fb-text-secondary">·</span>
            {visibilityIcon[visibility]}
          </div>
        </div>
      </div>
      <PostHeaderAction
        data={post}
        accessToken={accessToken}
        groupId={groupId}
        loggedinUserId={loggedinUserId}
      />
    </div>
  );
};
