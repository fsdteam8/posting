"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteCollection } from "@/hooks/features/saved/use-delete-collection";
import type { SavedCollection } from "@/types/features/saved";
import { Loader2 } from "lucide-react";

interface Props {
  accessToken: string;
  collection: SavedCollection | null;
  onClose: (deleted: boolean) => void;
}

export function DeleteCollectionDialog({
  accessToken,
  collection,
  onClose,
}: Props) {
  const { mutate, isPending } = useDeleteCollection({ accessToken });

  if (!collection) return null;

  return (
    <AlertDialog
      open={Boolean(collection)}
      onOpenChange={(o) => !o && onClose(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete &ldquo;{collection.name}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The saved posts inside this collection will stay in your Saved
            items. This action can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              if (!collection) return;
              mutate(collection._id, {
                onSuccess: (res) => res.success && onClose(true),
              });
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
