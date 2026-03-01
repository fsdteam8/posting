"use client";

import {
  Award,
  Globe,
  MessageCircle,
  MoreHorizontal,
  Play,
  Share2,
  ThumbsUp,
} from "lucide-react";

interface PostComment {
  id: number;
  name: string;
  text: string;
  time: string;
  hasFollow?: boolean;
}

interface PostData {
  id: number;
  authorName: string;
  authorBadge?: string;
  timestamp: string;
  content: string;
  hasMedia: boolean;
  mediaType?: "video" | "image";
  reactions: {
    count: number;
    types: ("like" | "love" | "haha")[];
  };
  comments: number;
  shares: number;
  commentsList: PostComment[];
}

function ReactionIcon({ type }: { type: "like" | "love" | "haha" }) {
  if (type === "like") {
    return (
      <span className="w-4.5 h-4.5 rounded-full bg-fb-blue flex items-center justify-center text-[10px]">
        <ThumbsUp className="w-2.5 h-2.5 text-fb-bg-card fill-fb-bg-card" />
      </span>
    );
  }
  if (type === "love") {
    return (
      <span className="w-4.5 h-4.5 rounded-full bg-fb-reaction-love flex items-center justify-center text-[10px]">
        <span className="text-fb-bg-card">{"❤"}</span>
      </span>
    );
  }
  return (
    <span className="w-4.5 h-4.5 rounded-full bg-fb-reaction-haha flex items-center justify-center text-[10px]">
      <span>{"😄"}</span>
    </span>
  );
}

export default function GroupPostCard({ post }: { post: PostData }) {
  return (
    <div className="bg-fb-bg-card rounded-lg shadow-sm">
      {/* Post header */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#e11d48] to-[#f43f5e] shrink-0" />
          <div>
            <p className="text-[15px] font-semibold text-fb-text-primary leading-tight">
              {post.authorName}
            </p>
            {post.authorBadge && (
              <div className="flex items-center gap-1 mt-0.5">
                <Award className="w-3.5 h-3.5 text-[#6a3cb5]" />
                <span className="text-[12px] text-[#6a3cb5] font-medium">
                  {post.authorBadge}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[12px] text-fb-text-secondary">
                {post.timestamp}
              </span>
              <span className="text-[12px] text-fb-text-secondary">{"·"}</span>
              <Globe className="w-3 h-3 text-fb-text-secondary" />
            </div>
          </div>
        </div>
        <button
          className="p-2 rounded-full hover:bg-fb-hover transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5 text-fb-text-secondary" />
        </button>
      </div>

      {/* Post content */}
      <div className="px-4 pb-2">
        <p className="text-[15px] text-fb-text-primary leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Post media */}
      {post.hasMedia && (
        <div className="relative bg-fb-text-primary aspect-video overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-[#2a1a1a] to-[#1a1a2a]" />
          <div className="absolute inset-0 flex items-center justify-center">
            {post.mediaType === "video" && (
              <div className="w-16 h-16 rounded-full bg-fb-text-primary/60 flex items-center justify-center backdrop-blur-sm">
                <Play className="w-8 h-8 text-fb-bg-card fill-fb-bg-card ml-1" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reactions bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-0.5">
            {post.reactions.types.map((type, i) => (
              <ReactionIcon key={i} type={type} />
            ))}
          </div>
          <span className="text-[15px] text-fb-text-secondary ml-1">
            {post.reactions.count.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[15px] text-fb-text-secondary hover:underline cursor-pointer">
            {post.comments} comments
          </span>
          <span className="text-[15px] text-fb-text-secondary hover:underline cursor-pointer">
            {post.shares} shares
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-fb-divider mx-4 flex items-center">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md hover:bg-fb-hover transition-colors">
          <ThumbsUp className="w-5 h-5 text-fb-text-secondary" />
          <span className="text-[15px] font-semibold text-fb-text-secondary">
            Like
          </span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md hover:bg-fb-hover transition-colors">
          <MessageCircle className="w-5 h-5 text-fb-text-secondary" />
          <span className="text-[15px] font-semibold text-fb-text-secondary">
            Comment
          </span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md hover:bg-fb-hover transition-colors">
          <Share2 className="w-5 h-5 text-fb-text-secondary" />
          <span className="text-[15px] font-semibold text-fb-text-secondary">
            Share
          </span>
        </button>
      </div>

      {/* Comments section */}
      {post.commentsList.length > 0 && (
        <div className="border-t border-fb-divider px-4 pt-1 pb-3">
          <button className="text-[15px] font-semibold text-fb-text-secondary hover:underline py-1.5">
            View more comments
          </button>
          {post.commentsList.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2 mt-2">
              <div className="w-8 h-8 rounded-full bg-secondary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="bg-fb-bg-wash rounded-2xl px-3 py-2 inline-block max-w-full">
                  <p className="text-[13px] font-semibold text-fb-text-primary">
                    {comment.name}
                    {comment.hasFollow && (
                      <span className="font-semibold text-fb-blue ml-1.5">
                        {"·"} Follow
                      </span>
                    )}
                  </p>
                  <p className="text-[15px] text-fb-text-primary leading-snug">
                    {comment.text}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-0.5 ml-3">
                  <span className="text-[12px] text-fb-text-secondary">
                    {comment.time}
                  </span>
                  <button className="text-[12px] font-bold text-fb-text-secondary hover:underline">
                    Like
                  </button>
                  <button className="text-[12px] font-bold text-fb-text-secondary hover:underline">
                    Reply
                  </button>
                  <button className="text-[12px] font-bold text-fb-text-secondary hover:underline">
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
