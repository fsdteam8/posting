"use client";

import { useGetPinnedPostOfGroup } from "@/hooks/features/groups/api/featured/use-get-pineed-post";
import { Post } from "@/types/features/posts";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Info, Pin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Props {
  groupId: string;
  accessToken: string;
}

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getPostThumbnail = (post: Post) =>
  post.images?.[0]?.url ||
  post.videos?.[0]?.thumbnail ||
  post.video?.thumbnail ||
  null;

const getPostTitle = (post: Post) => {
  const text = stripHtml(post.content || "");
  if (text) return text.length > 80 ? `${text.slice(0, 80)}…` : text;
  if (post.title) return post.title;
  if (post.images?.length) return "Shared a photo";
  if (post.videos?.length || post.video?.url) return "Shared a video";
  return "Untitled post";
};

export default function GroupFeaturedSection({ groupId, accessToken }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useGetPinnedPostOfGroup({ groupId, accessToken });

  const posts = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.pagination?.total ?? posts.length;

  if (!isLoading && posts.length === 0) return null;

  return (
    <div className="bg-card rounded-lg shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-fb-hover transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-fb-text-primary" />
          <span className="text-[15px] font-bold text-fb-text-primary">
            Pinned
          </span>
          <Info className="w-4 h-4 text-fb-text-secondary" />
        </div>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <span className="text-[13px] font-semibold text-fb-blue">
              {total} pinned
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-fb-text-secondary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-fb-text-secondary" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {posts.map((post) => {
            const thumbnail = getPostThumbnail(post);
            return (
              <div
                key={post._id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-fb-hover transition-colors cursor-pointer"
              >
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt=""
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-md object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-fb-bg-wash shrink-0 flex items-center justify-center">
                    <Pin className="w-5 h-5 text-fb-text-secondary" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-fb-text-primary truncate">
                    {getPostTitle(post)}
                  </p>
                  <p className="text-[12px] text-fb-text-secondary">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
