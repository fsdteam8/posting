"use client";

import { ArrowLeft, Clock, Search, TrendingUp, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";

interface NavSearchProps {
  onSearch?: (query: string) => void;
}

const RECENT_KEY = "postin:recent-searches";
const MAX_RECENTS = 8;

const TRENDING = [
  "Photography",
  "Travel",
  "Food",
  "Music",
  "Tech",
  "Sports",
];

function loadRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveRecents(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

export function NavSearch({}: NavSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  function commitSearch(rawQuery: string) {
    const searchQuery = rawQuery.trim();

    if (!searchQuery) {
      router.push("/search");
      return;
    }

    // Update recents: move to front, dedupe (case-insensitive), cap length
    setRecents((prev) => {
      const next = [
        searchQuery,
        ...prev.filter((r) => r.toLowerCase() !== searchQuery.toLowerCase()),
      ].slice(0, MAX_RECENTS);
      saveRecents(next);
      return next;
    });

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }

  function handleSearch() {
    commitSearch(query);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      handleClear();
      inputRef.current?.blur();
    }
  }

  function handleMobileKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
      setMobileOpen(false);
    }
    if (e.key === "Escape") closeMobile();
  }

  function openMobile() {
    setMobileOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), 50);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  function handleClear() {
    setQuery("");
    router.push("/search");
  }

  function pickSuggestion(value: string) {
    setQuery(value);
    commitSearch(value);
    setMobileOpen(false);
  }

  function removeRecent(value: string) {
    setRecents((prev) => {
      const next = prev.filter((r) => r !== value);
      saveRecents(next);
      return next;
    });
  }

  function clearAllRecents() {
    setRecents([]);
    saveRecents([]);
  }

  const trimmed = query.trim().toLowerCase();
  const filteredRecents = trimmed
    ? recents.filter((r) => r.toLowerCase().includes(trimmed))
    : recents;

  return (
    <>
      {/* Desktop search */}
      <div className="relative hidden sm:flex h-10 w-56 items-center gap-2 rounded-full bg-input px-3 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
        <Search className="size-4 shrink-0 text-muted-foreground" />

        <input
          ref={inputRef}
          type="text"
          placeholder="Search Postin"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {query && (
          <button
            onClick={handleClear}
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
            aria-label="Clear search"
          >
            <X className="size-3 text-foreground" />
          </button>
        )}
      </div>

      {/* Mobile trigger */}
      <button
        onClick={openMobile}
        className="flex sm:hidden size-10 items-center justify-center rounded-full bg-input text-muted-foreground hover:bg-border transition-colors"
        aria-label="Open search"
      >
        <Search className="size-4" />
      </button>

      {/* Mobile fullscreen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-card sm:hidden">
          {/* Top bar */}
          <div className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
            <button
              onClick={closeMobile}
              className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-input transition-colors"
              aria-label="Close search"
            >
              <ArrowLeft className="size-5 text-foreground" />
            </button>

            <div className="flex flex-1 h-10 items-center gap-2 rounded-full bg-input px-3 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
              <Search className="size-4 shrink-0 text-muted-foreground" />

              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search Postin"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleMobileKeyDown}
                className="h-full w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />

              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-3 text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* "Search for X" row when typing */}
            {trimmed && (
              <button
                onClick={() => pickSuggestion(query)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-input transition-colors"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Search className="size-4 text-primary" />
                </span>
                <span className="text-sm text-foreground truncate">
                  Search for &ldquo;<span className="font-medium">{query}</span>&rdquo;
                </span>
              </button>
            )}

            {/* Recent searches */}
            {filteredRecents.length > 0 && (
              <div className="px-2 py-2">
                <div className="flex items-center justify-between px-2 pb-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recent
                  </h3>
                  {!trimmed && (
                    <button
                      onClick={clearAllRecents}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <ul>
                  {filteredRecents.map((item) => (
                    <li
                      key={item}
                      className="flex items-center rounded-lg hover:bg-input transition-colors"
                    >
                      <button
                        onClick={() => pickSuggestion(item)}
                        className="flex flex-1 items-center gap-3 px-2 py-2 text-left min-w-0"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Clock className="size-4 text-muted-foreground" />
                        </span>
                        <span className="text-sm text-foreground truncate">
                          {item}
                        </span>
                      </button>
                      <button
                        onClick={() => removeRecent(item)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted-foreground/15 mr-1"
                        aria-label={`Remove ${item} from recent searches`}
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trending (only when not typing) */}
            {!trimmed && (
              <div className="px-4 py-3">
                <h3 className="flex items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <TrendingUp className="size-3.5" />
                  Trending
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => pickSuggestion(tag)}
                      className="rounded-full bg-input px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state — only when nothing else to show */}
            {!trimmed && filteredRecents.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-muted-foreground">
                <Search className="size-10 opacity-20" />
                <p className="text-sm text-center">
                  Search posts, people, pages and more
                </p>
              </div>
            )}

            {/* Filtered-recents empty (typing but no match) */}
            {trimmed && filteredRecents.length === 0 && (
              <p className="px-4 py-3 text-xs text-muted-foreground">
                No recent searches match. Press Enter to search.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
