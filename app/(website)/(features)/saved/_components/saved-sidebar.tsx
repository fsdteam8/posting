"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetCollections } from "@/hooks/features/saved/use-get-collections";
import { cn } from "@/lib/utils";
import type { SavedCollection } from "@/types/features/saved";
import {
  Bookmark,
  Loader2,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { CreateCollectionDialog } from "./create-collection-dialog";
import { DeleteCollectionDialog } from "./delete-collection-dialog";
import { EditCollectionDialog } from "./edit-collection-dialog";
import type { SavedView } from "./saved-page-shell";

interface Props {
  accessToken: string;
  view: SavedView;
  onViewChange: (view: SavedView) => void;
}

export function SavedSidebar({ accessToken, view, onViewChange }: Props) {
  const { data, isLoading, isError } = useGetCollections({ accessToken });
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SavedCollection | null>(null);
  const [deleting, setDeleting] = useState<SavedCollection | null>(null);

  const collections = data?.data ?? [];

  return (
    <>
      <aside className="sticky top-0 flex h-[92vh] w-80 flex-col border-r border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <h2 className="text-xl font-bold text-foreground">Saved</h2>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
            aria-label="Saved settings"
          >
            <Settings className="size-4" />
          </button>
        </div>

        {/* Saved items entry */}
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => onViewChange({ kind: "all" })}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
              view.kind === "all"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/60",
            )}
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bookmark className="size-4" />
            </span>
            <span className="text-[14px] font-semibold text-foreground">
              Saved items
            </span>
          </button>
        </div>

        {/* My collections */}
        <div className="mt-4 flex-1 overflow-y-auto px-3 pb-3">
          <p className="px-2 pb-2 text-[13px] font-semibold text-muted-foreground">
            My collections
          </p>

          {isLoading && (
            <ul className="flex flex-col gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-2 py-2"
                >
                  <span className="size-8 animate-pulse rounded-full bg-muted" />
                  <span className="h-3 w-32 animate-pulse rounded bg-muted" />
                </li>
              ))}
            </ul>
          )}

          {isError && (
            <p className="px-2 py-1 text-[13px] text-muted-foreground">
              Couldn&apos;t load collections.
            </p>
          )}

          {!isLoading && !isError && collections.length === 0 && (
            <p className="px-2 py-1 text-[13px] text-muted-foreground">
              You don&apos;t have any collections yet.
            </p>
          )}

          {!isLoading && !isError && collections.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {collections.map((c) => {
                const active =
                  view.kind === "collection" && view.collectionId === c._id;
                return (
                  <li key={c._id} className="group/item relative">
                    <button
                      type="button"
                      onClick={() =>
                        onViewChange({
                          kind: "collection",
                          collectionId: c._id,
                          name: c.name,
                        })
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                        active
                          ? "bg-accent text-foreground"
                          : "text-foreground hover:bg-accent/60",
                      )}
                    >
                      <Avatar className="size-8">
                        <AvatarImage src={c.coverImage?.url} alt={c.name} />
                        <AvatarFallback className="bg-muted text-[11px] font-semibold uppercase text-muted-foreground">
                          {c.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[14px] font-semibold text-foreground">
                          {c.name}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          {c.privacy === "private" ? (
                            <>
                              <Lock className="size-3" />
                              Only Me
                            </>
                          ) : c.privacy === "friends" ? (
                            <>
                              <Users className="size-3" />
                              Friends
                            </>
                          ) : (
                            <>
                              <Users className="size-3" />
                              Public
                            </>
                          )}
                        </span>
                      </div>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-background group-hover/item:opacity-100 focus:opacity-100"
                          aria-label={`Manage ${c.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setEditing(c)}>
                          <Pencil className="size-4" />
                          Edit collection
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(c)}
                        >
                          <Trash2 className="size-4" />
                          Delete collection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              })}
            </ul>
          )}

          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-4 w-full bg-primary/10 text-primary hover:bg-primary/15"
            disabled={isLoading && !data}
          >
            {isLoading && !data ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Plus className="mr-2 size-4" />
            )}
            Create new collection
          </Button>
        </div>
      </aside>

      <CreateCollectionDialog
        accessToken={accessToken}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <EditCollectionDialog
        accessToken={accessToken}
        collection={editing}
        onClose={() => setEditing(null)}
      />

      <DeleteCollectionDialog
        accessToken={accessToken}
        collection={deleting}
        onClose={(deleted) => {
          if (
            deleted &&
            view.kind === "collection" &&
            deleting &&
            view.collectionId === deleting._id
          ) {
            onViewChange({ kind: "all" });
          }
          setDeleting(null);
        }}
      />
    </>
  );
}
