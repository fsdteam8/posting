"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToggleSavePost } from "@/hooks/features/saved/use-toggle-save-post";
import { cn } from "@/lib/utils";
import type { SavedItem } from "@/types/features/saved";
import { formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Share2,
  Trash2,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { AddToCollectionPopover } from "./add-to-collection-popover";

interface Props {
  accessToken: string;
  item: SavedItem;
}

function plainText(html: string | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function SavedItemCard({ accessToken, item }: Props) {
  const { post, collectionId, createdAt } = item;
  const { mutate: toggle, isPending } = useToggleSavePost({ accessToken });

  const thumbnail =
    post.images?.[0]?.url ||
    post.video?.thumbnail ||
    post.videos?.[0]?.thumbnail;

  const fallbackIcon =
    post.postType === "video" || post.postType === "reel" ? (
      <Video className="size-8 text-muted-foreground" />
    ) : post.postType === "image" ? (
      <ImageIcon className="size-8 text-muted-foreground" />
    ) : (
      <FileText className="size-8 text-muted-foreground" />
    );

  const title =
    post.title?.trim() ||
    plainText(post.content).slice(0, 80) ||
    "Untitled post";

  const authorName =
    `${post.author?.firstName ?? ""} ${post.author?.lastName ?? ""}`.trim() ||
    post.author?.username ||
    "Unknown";

  const savedAgo = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: false })
    : "";

  const postUrl = `/posts/${post._id}`;

  async function handleShare() {
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}${postUrl}`;
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // user cancelled or clipboard unavailable
    }
  }

  function handleRemove() {
    toggle({ postId: post._id, collectionId: collectionId ?? undefined });
  }

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-sm">
      <Link
        href={postUrl}
        className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {fallbackIcon}
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={postUrl}
          className="line-clamp-2 text-[15px] font-semibold text-foreground hover:underline"
        >
          {title}
        </Link>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Post · {authorName}
        </p>
        <p
          className={cn(
            "mt-0.5 inline-flex w-fit items-center text-[11px] font-semibold",
            "bg-yellow-100 px-1 py-0.5 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
          )}
        >
          Saved{savedAgo ? ` ${savedAgo} ago` : ""}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <AddToCollectionPopover
            accessToken={accessToken}
            postId={post._id}
            currentCollectionId={collectionId}
          />

          <button
            type="button"
            onClick={handleShare}
            className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent"
            aria-label="Share"
          >
            <Share2 className="size-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent"
                aria-label="More options"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="size-4" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href={postUrl}>
                  <ExternalLink className="size-4" />
                  View post
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="size-4" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleRemove}
                disabled={isPending}
              >
                <Trash2 className="size-4" />
                {collectionId
                  ? "Remove from collection"
                  : "Remove from saved"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
