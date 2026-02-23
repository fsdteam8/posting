"use client";

import { ArrowLeft, Search, X } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useRef, useState } from "react";

interface NavSearchProps {
  onSearch?: (query: string) => void;
}

export function NavSearch({}: NavSearchProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      const searchQuery = query.trim();
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }

    if (e.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
    }
  }

  function handleMobileKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      const searchQuery = query.trim();
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setMobileOpen(false);
    }

    if (e.key === "Escape") {
      closeMobile();
    }
  }

  function openMobile() {
    setMobileOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), 50);
  }

  function closeMobile() {
    setMobileOpen(false);
    setQuery("");
  }

  function handleClear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <>
      {/* Desktop search — always visible on sm+ */}
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

      {/* Mobile trigger — icon only, visible below sm */}
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
          <div className="flex h-14 items-center gap-2 border-b px-3">
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
                className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
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

          {/* Hint */}
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-muted-foreground">
            <Search className="size-10 opacity-20" />
            <p className="text-sm">
              {query
                ? `Press Enter to search "${query}"`
                : "Type something to search"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
