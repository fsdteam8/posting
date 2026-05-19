"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetAllFriends } from "@/hooks/features/friends/use-get-all-friends";
import { useStartDirectChat } from "@/hooks/features/messenger/use-start-direct-chat";
import { cn } from "@/lib/utils";
import type { Friend } from "@/types/features/friends";
import { Loader2, MoreHorizontal, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

interface Props {
  accessToken: string;
}

export function ContactsCard({ accessToken }: Props) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError } = useGetAllFriends({
    accessToken,
    page: 1,
    limit: 50,
  });

  const { startChat, isStarting } = useStartDirectChat({ accessToken });

  // Sort: online first, then alphabetical by first name.
  const friends: Friend[] = useMemo(() => {
    const list = [...(data?.data ?? [])];
    return list.sort((a, b) => {
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      return (a.firstName ?? "").localeCompare(b.firstName ?? "");
    });
  }, [data?.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => {
      const first = (f.firstName ?? "").toLowerCase();
      const last = (f.lastName ?? "").toLowerCase();
      const user = (f.username ?? "").toLowerCase();
      return (
        first.includes(q) ||
        last.includes(q) ||
        user.includes(q) ||
        `${first} ${last}`.includes(q)
      );
    });
  }, [friends, query]);

  function toggleSearch() {
    setSearching((open) => {
      const next = !open;
      if (!next) setQuery("");
      else
        // Focus after mount on next paint
        requestAnimationFrame(() => inputRef.current?.focus());
      return next;
    });
  }

  function handleStartChat(friend: Friend) {
    setPendingId(friend._id);
    startChat(friend._id);
    // The mutation handles the toast/error; reset pending shortly after.
    setTimeout(() => setPendingId(null), 1500);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold text-foreground">Contacts</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleSearch}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors",
              searching
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-card",
            )}
            aria-label={searching ? "Close search" : "Search contacts"}
            aria-expanded={searching}
          >
            <Search className="size-4" />
          </button>
          <Link
            href="/friends"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card"
            aria-label="See all contacts"
          >
            <MoreHorizontal className="size-4" />
          </Link>
        </div>
      </div>

      {/* Search input */}
      {searching && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts"
            className="w-full pl-7.5 pr-7 py-1.5 rounded-full bg-card border border-border text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {/* States */}
      {isLoading && (
        <ul className="flex flex-col gap-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5"
            >
              <span className="size-8 rounded-full bg-muted animate-pulse" />
              <span className="h-3 w-32 rounded bg-muted animate-pulse" />
            </li>
          ))}
        </ul>
      )}

      {isError && (
        <p className="text-[13px] text-muted-foreground px-2 py-1.5">
          Couldn&apos;t load contacts.
        </p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <p className="text-[13px] text-muted-foreground px-2 py-3">
          {query
            ? `No contacts match “${query}”`
            : "Add some friends to see them here."}
        </p>
      )}

      {/* List */}
      {!isLoading && !isError && filtered.length > 0 && (
        <ul className="flex flex-col">
          {filtered.map((friend) => {
            const fullName = `${friend.firstName} ${friend.lastName}`.trim();
            const isPending =
              isStarting && pendingId === friend._id;
            return (
              <li key={friend._id}>
                <button
                  type="button"
                  onClick={() => handleStartChat(friend)}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={friend.profileImage?.url}
                        alt={fullName}
                      />
                      <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                        {(friend.firstName?.[0] ?? "") +
                          (friend.lastName?.[0] ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    {friend.isOnline && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-green-500"
                        aria-label="Online"
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[14px] font-medium truncate flex-1",
                      friend.isOnline
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {fullName}
                  </span>
                  {isPending && (
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
