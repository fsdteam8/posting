"use client";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  Search,
  TrendingUp,
  Users as UsersIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  Suggestion,
  useSearchSuggestions,
} from "@/hooks/features/search/api/use-search-suggestions";
import { cn } from "@/lib/utils";

interface NavSearchProps {
  onSearch?: (query: string) => void;
  accessToken?: string;
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

// ── Recents store, hydrated via useSyncExternalStore ─────────────────────────
const EMPTY_RECENTS: string[] = [];
let cachedRecents: string[] | null = null;
const recentsListeners = new Set<() => void>();

function readRecentsRaw(): string[] {
  if (typeof window === "undefined") return EMPTY_RECENTS;
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return EMPTY_RECENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : EMPTY_RECENTS;
  } catch {
    return EMPTY_RECENTS;
  }
}

function subscribeRecents(callback: () => void) {
  recentsListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === RECENT_KEY) {
      cachedRecents = null;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    recentsListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getRecentsSnapshot(): string[] {
  if (cachedRecents !== null) return cachedRecents;
  cachedRecents = readRecentsRaw();
  return cachedRecents;
}

function getRecentsServerSnapshot(): string[] {
  return EMPTY_RECENTS;
}

function writeRecents(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
  cachedRecents = items;
  recentsListeners.forEach((cb) => cb());
}

function SuggestionIcon({ type }: { type: Suggestion["type"] }) {
  if (type === "user")
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UsersIcon className="size-4" />
      </span>
    );
  if (type === "group")
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
        <UsersIcon className="size-4" />
      </span>
    );
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
      <CalendarDays className="size-4" />
    </span>
  );
}

interface SearchPanelBodyProps {
  compact?: boolean;
  trimmed: string;
  query: string;
  suggestions: Suggestion[];
  suggestLoading: boolean;
  filteredRecents: string[];
  onPickSuggestion: (value: string) => void;
  onPickSuggestionItem: (suggestion: Suggestion) => void;
  onRemoveRecent: (value: string) => void;
  onClearAllRecents: () => void;
}

function SearchPanelBody({
  compact,
  trimmed,
  query,
  suggestions,
  suggestLoading,
  filteredRecents,
  onPickSuggestion,
  onPickSuggestionItem,
  onRemoveRecent,
  onClearAllRecents,
}: SearchPanelBodyProps) {
  const showSuggestions = !!trimmed && suggestions.length > 0;
  const showNoResults =
    !!trimmed && !suggestLoading && suggestions.length === 0;

  return (
    <div
      className={cn(
        "flex flex-col",
        compact ? "max-h-[60vh]" : "max-h-[70vh]",
      )}
    >
      {trimmed && (
        <button
          onClick={() => onPickSuggestion(query)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-input transition-colors border-b"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Search className="size-4 text-primary" />
          </span>
          <span className="text-sm text-foreground truncate">
            Search for <span className="font-medium">&ldquo;{query}&rdquo;</span>
          </span>
          {suggestLoading && (
            <Loader2 className="ml-auto size-4 animate-spin text-muted-foreground" />
          )}
        </button>
      )}

      <div className="overflow-y-auto">
        {showSuggestions && (
          <div className="px-2 py-2">
            <h3 className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Suggestions
            </h3>
            <ul>
              {suggestions.map((s) => (
                <li key={`${s.type}-${s._id}`}>
                  <button
                    onClick={() => onPickSuggestionItem(s)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-input transition-colors"
                  >
                    {s.image ? (
                      <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                        <Image
                          src={s.image}
                          alt={s.label}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </span>
                    ) : (
                      <SuggestionIcon type={s.type} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {s.label}
                      </p>
                      {s.sublabel && (
                        <p className="truncate text-xs text-muted-foreground">
                          {s.sublabel}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {s.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showNoResults && (
          <p className="px-4 py-3 text-xs text-muted-foreground">
            No matches found. Press Enter to search anyway.
          </p>
        )}

        {filteredRecents.length > 0 && (
          <div className="px-2 py-2">
            <div className="flex items-center justify-between px-2 pb-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recent
              </h3>
              {!trimmed && (
                <button
                  onClick={onClearAllRecents}
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
                    onClick={() => onPickSuggestion(item)}
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
                    onClick={() => onRemoveRecent(item)}
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
                  onClick={() => onPickSuggestion(tag)}
                  className="rounded-full bg-input px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {!trimmed && filteredRecents.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-muted-foreground">
            <Search className="size-10 opacity-20" />
            <p className="text-sm text-center">
              Search posts, people, pages and more
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function NavSearch({ accessToken }: NavSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const recents = useSyncExternalStore(
    subscribeRecents,
    getRecentsSnapshot,
    getRecentsServerSnapshot,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopWrapperRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const lowerTrimmed = trimmed.toLowerCase();

  const { data: suggestData, isFetching: suggestLoading } =
    useSearchSuggestions({
      query: trimmed,
      limit: 6,
      accessToken,
      enabled: desktopOpen || mobileOpen,
    });

  const suggestions: Suggestion[] = suggestData?.data?.suggestions ?? [];

  const filteredRecents = lowerTrimmed
    ? recents.filter((r) => r.toLowerCase().includes(lowerTrimmed))
    : recents;

  // ── Close desktop popover on outside click ────────────────────────────────
  useEffect(() => {
    if (!desktopOpen) return;
    function handle(e: MouseEvent) {
      if (
        desktopWrapperRef.current &&
        !desktopWrapperRef.current.contains(e.target as Node)
      ) {
        setDesktopOpen(false);
      }
    }
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, [desktopOpen]);

  function commitSearch(rawQuery: string) {
    const searchQuery = rawQuery.trim();

    if (!searchQuery) {
      router.push("/search");
      return;
    }

    const next = [
      searchQuery,
      ...recents.filter((r) => r.toLowerCase() !== searchQuery.toLowerCase()),
    ].slice(0, MAX_RECENTS);
    writeRecents(next);

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }

  function handleSearch() {
    commitSearch(query);
    setDesktopOpen(false);
    setMobileOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setDesktopOpen(false);
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
    inputRef.current?.focus();
  }

  function pickSuggestion(value: string) {
    setQuery(value);
    commitSearch(value);
    setMobileOpen(false);
    setDesktopOpen(false);
  }

  function pickSuggestionItem(s: Suggestion) {
    // Record the textual label as a recent search so it appears next time.
    const label = s.label.trim();
    if (label) {
      const next = [
        label,
        ...recents.filter((r) => r.toLowerCase() !== label.toLowerCase()),
      ].slice(0, MAX_RECENTS);
      writeRecents(next);
    }
    setDesktopOpen(false);
    setMobileOpen(false);
    router.push(s.href);
  }

  function removeRecent(value: string) {
    writeRecents(recents.filter((r) => r !== value));
  }

  function clearAllRecents() {
    writeRecents([]);
  }

  return (
    <>
      {/* Desktop / tablet inline search */}
      <div
        ref={desktopWrapperRef}
        className="relative hidden sm:flex sm:w-72 md:w-96 lg:w-125"
      >
        <div
          className={cn(
            "relative flex h-10 w-full items-center gap-2 rounded-full bg-input px-3 transition-all",
            "focus-within:ring-2 focus-within:ring-primary/40",
            desktopOpen && "ring-2 ring-primary/40",
          )}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />

          <input
            ref={inputRef}
            type="text"
            placeholder="Search Postin"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDesktopOpen(true);
            }}
            onFocus={() => setDesktopOpen(true)}
            onKeyDown={handleKeyDown}
            className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-autocomplete="list"
          />

          {suggestLoading && trimmed && (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          )}

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

        {/* Desktop suggestion modal (popover-style) */}
        {desktopOpen && (
          <div
            role="dialog"
            aria-label="Search suggestions"
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-black/5"
          >
            <SearchPanelBody
              trimmed={trimmed}
              query={query}
              suggestions={suggestions}
              suggestLoading={suggestLoading}
              filteredRecents={filteredRecents}
              onPickSuggestion={pickSuggestion}
              onPickSuggestionItem={pickSuggestionItem}
              onRemoveRecent={removeRecent}
              onClearAllRecents={clearAllRecents}
            />
          </div>
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

      {/* Mobile search modal — full-width search box at top, suggestions below */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/40 sm:hidden">
          {/* Top sheet */}
          <div className="bg-card shadow-lg">
            <div className="flex h-14 items-center gap-2 border-b px-3">
              <button
                onClick={closeMobile}
                className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-input transition-colors"
                aria-label="Close search"
              >
                <ArrowLeft className="size-5 text-foreground" />
              </button>

              <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-input px-3 ring-2 ring-primary/40 transition-all">
                <Search className="size-4 shrink-0 text-muted-foreground" />

                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Search Postin"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleMobileKeyDown}
                  className="h-full w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  aria-autocomplete="list"
                />

                {suggestLoading && trimmed && (
                  <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                )}

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

            {/* Suggestion modal — sits directly under the search box, full-width card */}
            <div className="border-t bg-card">
              <SearchPanelBody
                compact
                trimmed={trimmed}
                query={query}
                suggestions={suggestions}
                suggestLoading={suggestLoading}
                filteredRecents={filteredRecents}
                onPickSuggestion={pickSuggestion}
                onPickSuggestionItem={pickSuggestionItem}
                onRemoveRecent={removeRecent}
                onClearAllRecents={clearAllRecents}
              />
            </div>
          </div>

          {/* Tap-to-dismiss area */}
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close search"
            className="flex-1"
          />
        </div>
      )}
    </>
  );
}
