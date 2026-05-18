"use client";

import { DEFAULT_IMAGES } from "@/constants";
import { Post } from "@/types/features/posts";
import { formatDistanceToNow } from "date-fns";
import { Globe, Lock, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
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
  groupId?: string;
  loggedinUserId: string;
}

export const PostHeader = ({
  post,
  accessToken,
  groupId = "",
  loggedinUserId,
}: PostHeaderProps) => {
  const { author, createdAt, visibility, feeling, activity } = post;
  const router = useRouter();

  const avatarUrl = author.profileImage?.url || DEFAULT_IMAGES.user.avatar;

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

  const onProfileGo = () => {
    router.push(`/public/profile/${post.author.username}`);
  };

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
            <p
              className="text-[15px] font-semibold text-fb-text-primary hover:text-primary cursor-pointer"
              onClick={onProfileGo}
            >
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
            {buildTagLine(post.tags) && (
              <span className="text-[14px] text-fb-text-secondary font-normal">
                is with {buildTagLine(post.tags)}
              </span>
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

function buildTagLine(tags: Post["tags"]): React.ReactNode | null {
  if (!tags || tags.length === 0) return null;

  const first = tags[0];
  const second = tags[1];
  const rest = tags.length - 2;

  if (tags.length === 1)
    return (
      <span className="font-semibold text-fb-text-primary">
        {first.firstName} {first.lastName}
      </span>
    );

  if (tags.length === 2)
    return (
      <>
        <span className="font-semibold text-fb-text-primary">
          {first.firstName} {first.lastName}
        </span>{" "}
        and{" "}
        <span className="font-semibold text-fb-text-primary">
          {second.firstName} {second.lastName}
        </span>
      </>
    );

  return (
    <>
      <span className="font-semibold text-fb-text-primary">
        {first.firstName} {first.lastName}
      </span>
      ,{" "}
      <span className="font-semibold text-fb-text-primary">
        {second.firstName} {second.lastName}
      </span>{" "}
      and{" "}
      <span className="font-semibold text-fb-text-primary">{rest} others</span>
    </>
  );
}
