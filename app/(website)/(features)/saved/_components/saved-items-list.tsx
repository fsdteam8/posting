"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetSavedPosts } from "@/hooks/features/saved/use-get-saved-posts";
import type { SavedItem } from "@/types/features/saved";
import { Bookmark, Loader2, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SavedView } from "./saved-page-shell";
import { SavedItemCard } from "./saved-item-card";

interface Props {
  accessToken: string;
  view: SavedView;
}

type SortMode = "recent" | "oldest";
type TypeFilter = "all" | "image" | "video" | "text";

export function SavedItemsList({ accessToken, view }: Props) {
  const [sort, setSort] = useState<SortMode>("recent");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useGetSavedPosts({
    accessToken,
    collectionId: view.kind === "collection" ? view.collectionId : null,
  });

  const items = useMemo<SavedItem[]>(() => {
    const flat = (data?.pages ?? []).flatMap((p) => p.data ?? []);
    // dedupe by post id when viewing "All" (a post may exist in multiple collections)
    const seen = new Set<string>();
    return flat.filter((it) => {
      if (!it?.post?._id) return false;
      const key =
        view.kind === "all" ? it.post._id : `${it.post._id}-${it.collectionId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data?.pages, view.kind]);

  const filtered = useMemo(() => {
    const list = items.filter((it) => {
      if (typeFilter === "all") return true;
      const t = it.post.postType;
      if (typeFilter === "video") return t === "video" || t === "reel";
      return t === typeFilter;
    });
    if (sort === "oldest") {
      return [...list].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    return list;
  }, [items, sort, typeFilter]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const heading = view.kind === "all" ? "All" : view.name;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{heading}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full hover:bg-accent"
              aria-label="Filter saved items"
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(v) => setSort(v as SortMode)}
            >
              <DropdownMenuRadioItem value="recent">
                Most recent
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">
                Oldest first
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Type</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setTypeFilter("all")}>
              All types {typeFilter === "all" && "✓"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("image")}>
              Photos {typeFilter === "image" && "✓"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("video")}>
              Videos {typeFilter === "video" && "✓"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("text")}>
              Text posts {typeFilter === "text" && "✓"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* States */}
      {isLoading && (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-border bg-card p-3"
            >
              <span className="size-24 shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="flex flex-1 flex-col gap-2 py-1">
                <span className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <span className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                <span className="mt-auto h-7 w-32 animate-pulse rounded-full bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-[14px] text-destructive">
          {error?.message || "Failed to load saved items."}
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Bookmark className="size-7 text-primary" />
          </div>
          <p className="text-[15px] font-semibold text-foreground">
            {view.kind === "all"
              ? "Nothing saved yet"
              : "This collection is empty"}
          </p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            {view.kind === "all"
              ? "Tap the bookmark on any post to save it for later."
              : "Open a saved post and use “Add to collection” to put it here."}
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <ul className="flex flex-col gap-3">
          {filtered.map((item) => (
            <li key={`${item._id}-${item.collectionId ?? "none"}`}>
              <SavedItemCard accessToken={accessToken} item={item} />
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="flex justify-center py-3">
        {isFetchingNextPage && (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
