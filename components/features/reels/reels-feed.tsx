"use client";

import { useGetReels } from "@/hooks/features/reels/use-get-reels";
import { Reel } from "@/types/features/reels";
import { ChevronDown, ChevronUp, Loader2, Play } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ReelItem } from "./reel-item";

interface ReelsFeedProps {
  accessToken: string;
  loggedInUserId: string;
}

const MUTE_STORAGE_KEY = "reels.muted";

// ── Mute preference, hydrated from localStorage via useSyncExternalStore ─────
const mutedListeners = new Set<() => void>();

function subscribeMuted(callback: () => void) {
  mutedListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === MUTE_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    mutedListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getMutedSnapshot(): boolean {
  try {
    const stored = window.localStorage.getItem(MUTE_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

function getMutedServerSnapshot(): boolean {
  return true;
}

function writeMuted(value: boolean) {
  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(value));
  } catch {
    /* ignore quota errors */
  }
  mutedListeners.forEach((cb) => cb());
}

export const ReelsFeed = ({ accessToken, loggedInUserId }: ReelsFeedProps) => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetReels({ accessToken, limit: 5 });

  const reels: Reel[] = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data),
    [data],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const muted = useSyncExternalStore(
    subscribeMuted,
    getMutedSnapshot,
    getMutedServerSnapshot,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const toggleMute = useCallback(() => {
    writeMuted(!getMutedSnapshot());
  }, []);

  // Track which reel is visible
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    if (reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among entries, find the most-visible one above threshold
        let bestIdx = activeIndex;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idxAttr = (entry.target as HTMLElement).dataset.index;
          if (idxAttr === undefined) return;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = Number(idxAttr);
          }
        });
        if (bestRatio >= 0.6 && bestIdx !== activeIndex) {
          setActiveIndex(bestIdx);
        }
      },
      {
        root,
        threshold: [0.25, 0.6, 0.85],
      },
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [reels.length, activeIndex]);

  // Infinite scroll: load more when sentinel near
  useEffect(() => {
    const root = containerRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Keyboard navigation
  const scrollToIndex = useCallback((idx: number) => {
    const target = itemRefs.current[idx];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // ignore when typing inside input/textarea
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        if (activeIndex < reels.length - 1) scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        if (activeIndex > 0) scrollToIndex(activeIndex - 1);
      } else if (e.key.toLowerCase() === "m") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, reels.length, scrollToIndex, toggleMute]);

  // ── Render states ──

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-black flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-white text-base">
            {error instanceof Error ? error.message : "Could not load reels"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!reels.length) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-120 w-67.5 rounded-2xl bg-zinc-900 shadow-2xl flex items-center justify-center border border-zinc-800">
            <Play className="size-16 text-white opacity-80" />
            <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-black/70 via-transparent to-black/30" />
          </div>
          <h1 className="text-2xl font-bold text-white">No reels yet</h1>
          <p className="text-sm text-zinc-400">
            Short videos will appear here when people start posting them
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black">
      <div
        ref={containerRef}
        className="h-[calc(100vh-56px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reels.map((reel, idx) => (
          <div
            key={reel._id}
            data-index={idx}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className="h-[calc(100vh-56px)] w-full snap-start flex items-center justify-center"
          >
            <div className="relative h-full w-full max-w-115 mx-auto">
              <ReelItem
                reel={reel}
                isActive={idx === activeIndex}
                muted={muted}
                onToggleMute={toggleMute}
                accessToken={accessToken}
                loggedInUserId={loggedInUserId}
              />
            </div>
          </div>
        ))}

        {/* Infinite-scroll sentinel */}
        <div ref={sentinelRef} className="h-px w-full" />

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-white/80 animate-spin" />
          </div>
        )}
      </div>

      {/* Desktop nav arrows */}
      <div className="hidden md:flex flex-col gap-2 absolute right-4 top-1/2 -translate-y-1/2 z-30">
        <button
          type="button"
          onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          aria-label="Previous reel"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() =>
            scrollToIndex(Math.min(reels.length - 1, activeIndex + 1))
          }
          disabled={activeIndex >= reels.length - 1 && !hasNextPage}
          aria-label="Next reel"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
