"use client";

import { Button } from "@/components/ui/button";
import { useToggleFollowUser } from "@/hooks/features/users/use-toggle-follow-user";
import { useProfile } from "@/hooks/profile/use-profile";
import { Post } from "@/types/features/posts";
import { format } from "date-fns";
import {
  Check,
  Eye,
  Globe,
  Heart,
  Loader2,
  Lock,
  MessageCircle,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  post: Post;
  loggedInUserId: string;
  accessToken: string;
}

const visibilityMap = {
  public: { icon: Globe, label: "Public" },
  friends: { icon: Users, label: "Friends" },
  "friends of friends": { icon: Users, label: "Friends of friends" },
  "only me": { icon: Lock, label: "Only me" },
} as const;

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function PostDetailSidebar({
  post,
  loggedInUserId,
  accessToken,
}: Props) {
  const author = post.author;
  const fullName = `${author.firstName} ${author.lastName}`.trim();
  const avatarUrl = author.profileImage?.url;
  const isSelf = author._id === loggedInUserId;

  const { data: profile } = useProfile(accessToken);
  const isFollowing = Boolean(profile?.following?.includes(author._id));

  const { mutate: toggleFollow, isPending: isToggling } = useToggleFollowUser({
    accessToken,
  });

  const handleToggleFollow = () => {
    if (isToggling) return;
    toggleFollow({ userId: author._id, isFollowing });
  };

  const visibility =
    visibilityMap[post.visibility as keyof typeof visibilityMap] ??
    visibilityMap.public;
  const VisibilityIcon = visibility.icon;

  const stats = [
    { icon: Heart, label: "Reactions", value: post.reactionCount ?? 0 },
    { icon: MessageCircle, label: "Comments", value: post.commentCount ?? 0 },
    { icon: Share2, label: "Shares", value: post.shareCount ?? 0 },
    { icon: Eye, label: "Views", value: post.views ?? 0 },
  ];

  return (
    <aside className="space-y-3">
      {/* Author card */}
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="h-16 bg-linear-to-br from-primary/30 via-primary/15 to-transparent" />
        <div className="px-4 pb-4 -mt-8">
          <Link href={`/public/profile/${author.username}`} className="block">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-card bg-gray-200">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-[18px] font-semibold">
                  {author.firstName?.[0]}
                  {author.lastName?.[0]}
                </div>
              )}
            </div>
          </Link>

          <Link
            href={`/public/profile/${author.username}`}
            className="block mt-2 text-[16px] font-bold text-fb-text-primary hover:underline"
          >
            {fullName}
          </Link>
          <p className="text-[12px] text-fb-text-secondary">
            @{author.username}
          </p>

          {!isSelf && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant={isFollowing ? "secondary" : "default"}
                className="flex-1 gap-1.5"
                onClick={handleToggleFollow}
                disabled={isToggling}
                aria-pressed={isFollowing}
                aria-label={isFollowing ? "Unfollow" : "Follow"}
              >
                {isToggling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button size="sm" variant="secondary" className="flex-1" asChild>
                <Link href={`/public/profile/${author.username}`}>View</Link>
              </Button>
            </div>
          )}

          {isSelf && (
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-3"
              asChild
            >
              <Link href={`/public/profile/${author.username}`}>
                View profile
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Post info */}
      <div className="bg-card rounded-lg shadow-sm p-4">
        <h3 className="text-[15px] font-semibold text-fb-text-primary mb-3">
          Post details
        </h3>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[13px] text-fb-text-secondary">
            <VisibilityIcon className="w-4 h-4 shrink-0" />
            <span>{visibility.label}</span>
          </div>

          <div className="flex items-center gap-2 text-[13px] text-fb-text-secondary">
            <Globe className="w-4 h-4 shrink-0 opacity-0" />
            <span>
              Posted{" "}
              {format(
                new Date(post.publishedAt ?? post.createdAt),
                "MMM d, yyyy 'at' h:mm a",
              )}
            </span>
          </div>

          {post.group?._id && (
            <div className="flex items-center gap-2 text-[13px]">
              <Users className="w-4 h-4 shrink-0 text-fb-text-secondary" />
              <Link
                href={`/groups/view/${post.group.groupUserName ?? post.group._id}`}
                className="text-primary hover:underline font-medium"
              >
                {post.group.name}
              </Link>
            </div>
          )}
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg bg-fb-hover/50 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-fb-text-secondary mb-0.5">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wide">
                  {label}
                </span>
              </div>
              <p className="text-[16px] font-bold text-fb-text-primary">
                {formatCount(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
