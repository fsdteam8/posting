"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetCollections } from "@/hooks/features/saved/use-get-collections";
import { useToggleSavePost } from "@/hooks/features/saved/use-toggle-save-post";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  FolderCheck,
  FolderPlus,
  Loader2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { CreateCollectionDialog } from "./create-collection-dialog";

interface Props {
  accessToken: string;
  postId: string;
  currentCollectionId?: string | null;
  triggerClassName?: string;
  buttonLabel?: string;
}

export function AddToCollectionPopover({
  accessToken,
  postId,
  currentCollectionId,
  triggerClassName,
  buttonLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useGetCollections({ accessToken });
  const { mutate: toggle, isPending, variables } = useToggleSavePost({
    accessToken,
  });

  const collections = data?.data ?? [];
  const currentCollection = currentCollectionId
    ? collections.find((c) => c._id === currentCollectionId)
    : null;
  const inCollection = Boolean(currentCollection);

  const label =
    buttonLabel ??
    (currentCollection ? `In ${currentCollection.name}` : "Add to collection");

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex max-w-48 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors",
              inCollection
                ? "bg-primary/10 text-primary hover:bg-primary/15"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              triggerClassName,
            )}
          >
            {inCollection ? (
              <FolderCheck className="size-3.5 shrink-0" />
            ) : (
              <FolderPlus className="size-3.5 shrink-0" />
            )}
            <span className="truncate">{label}</span>
            <ChevronDown className="size-3.5 shrink-0 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <p className="px-2 pb-1.5 pt-1 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Add to a collection
          </p>

          {isLoading && (
            <div className="flex items-center justify-center px-2 py-3 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}

          {!isLoading && collections.length === 0 && (
            <p className="px-2 py-2 text-[13px] text-muted-foreground">
              No collections yet. Create one below.
            </p>
          )}

          {!isLoading && collections.length > 0 && (
            <ul className="flex max-h-64 flex-col overflow-y-auto">
              {collections.map((c) => {
                const isCurrent = currentCollectionId === c._id;
                const isPendingThis =
                  isPending && variables?.collectionId === c._id;
                return (
                  <li key={c._id}>
                    <button
                      type="button"
                      onClick={() => {
                        toggle(
                          { postId, collectionId: c._id },
                          { onSuccess: () => setOpen(false) },
                        );
                      }}
                      disabled={isPending}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Avatar className="size-7">
                        <AvatarImage src={c.coverImage?.url} alt={c.name} />
                        <AvatarFallback className="bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
                          {c.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                        {c.name}
                      </span>
                      {isPendingThis ? (
                        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                      ) : (
                        isCurrent && (
                          <Check className="size-4 text-primary" />
                        )
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-border pt-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Plus className="size-4" />
              Create new collection
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <CreateCollectionDialog
        accessToken={accessToken}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}
