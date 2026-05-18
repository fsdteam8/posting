"use client";

import { useFriends } from "@/hooks/features/messenger/api/use-friends";
import { cn } from "@/lib/utils";
import type { MessengerUser } from "@/types/messenger";
import { Check, Loader2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "./avatar";
import { getUserAvatar, userFullName } from "./helpers";

interface Props {
  open: boolean;
  accessToken: string;
  onClose: () => void;
  onCreate: (name: string, participantIds: string[]) => void;
  initialSelected?: MessengerUser[];
}

export function NewGroupDialog({
  open,
  accessToken,
  onClose,
  onCreate,
  initialSelected = [],
}: Props) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected.map((u) => u._id)),
  );
  const [selectedMap, setSelectedMap] = useState<Record<string, MessengerUser>>(
    () => Object.fromEntries(initialSelected.map((u) => [u._id, u])),
  );

  const { data, isLoading } = useFriends({ accessToken, limit: 50, q: query });
  const friends = useMemo(() => data?.data ?? [], [data]);

  if (!open) return null;

  function toggle(u: MessengerUser) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(u._id)) n.delete(u._id);
      else n.add(u._id);
      return n;
    });
    setSelectedMap((m) => ({ ...m, [u._id]: u }));
  }

  const selectedUsers = Array.from(selected)
    .map((id) => selectedMap[id])
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="flex-1 text-center text-[15px] font-semibold">
            New group
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name (optional)"
            className="h-11 w-full rounded-lg border bg-card px-3 text-[13px] outline-none focus:border-primary/40"
          />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for people"
              className="h-11 w-full rounded-lg border bg-card pl-9 pr-3 text-[13px] outline-none focus:border-primary/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {selectedUsers.length > 0 && (
            <>
              <p className="mb-2 text-[12px] font-semibold">Selected</p>
              <div className="mb-3 flex flex-col gap-2">
                {selectedUsers.map((u) => (
                  <Row
                    key={`sel-${u._id}`}
                    user={u}
                    selected
                    onToggle={() => toggle(u)}
                    iconKind="remove"
                  />
                ))}
              </div>
            </>
          )}

          <p className="mb-2 text-[12px] font-semibold">Suggestions</p>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : friends.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-muted-foreground">
              No friends found.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {friends.map((u) => (
                <Row
                  key={u._id}
                  user={u}
                  selected={selected.has(u._id)}
                  onToggle={() => toggle(u)}
                  iconKind="checkbox"
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <button
            type="button"
            onClick={() => onCreate(name, Array.from(selected))}
            className={cn(
              "h-11 w-full rounded-full bg-primary text-[14px] font-semibold text-primary-foreground transition",
              selected.size >= 2
                ? "cursor-pointer hover:opacity-90"
                : "cursor-not-allowed opacity-60",
            )}
            disabled={selected.size < 2}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  user,
  selected,
  onToggle,
  iconKind,
}: {
  user: MessengerUser;
  selected: boolean;
  onToggle: () => void;
  iconKind: "checkbox" | "remove";
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-left hover:bg-muted/40"
    >
      <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
        <Avatar
          src={getUserAvatar(user)}
          alt={userFullName(user)}
          sizes="36px"
        />
      </div>
      <span className="flex-1 truncate text-[13.5px]">
        {userFullName(user)}
      </span>
      {iconKind === "remove" ? (
        <X className="size-4 text-muted-foreground" />
      ) : (
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-md border",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input",
          )}
        >
          {selected && <Check className="size-3" />}
        </span>
      )}
    </button>
  );
}
