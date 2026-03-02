"use client";

import { Post } from "@/types/features/posts";
import { formatDistanceToNow } from "date-fns";
import { Globe, Lock, Users } from "lucide-react";
import Image from "next/image";
import PostHeaderAction from "./post-header-action";

const visibilityIcon = {
  public: <Globe className="w-3 h-3 text-fb-text-secondary" />,
  "only me": <Lock className="w-3 h-3 text-fb-text-secondary" />,
  friends: <Users className="w-3 h-3 text-fb-text-secondary" />,
  "friends of friends": <Users className="w-3 h-3 text-fb-text-secondary" />,
};

interface PostHeaderProps {
  post: Post;
}

export const PostHeader = ({ post }: PostHeaderProps) => {
  const { author, createdAt, visibility, feeling, activity } = post;

  const avatarUrl =
    author.profileImage?.url ||
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${author.firstName}&backgroundColor=b6e3f4`;

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  const feelingLine = feeling
    ? `is feeling ${feeling}`
    : activity
      ? `is ${activity}`
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
              <p className="text-[14px] text-fb-text-secondary">
                {feelingLine}
              </p>
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
      <PostHeaderAction data={post} />
    </div>
  );
};
