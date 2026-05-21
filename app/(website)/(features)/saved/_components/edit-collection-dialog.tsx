"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateCollection } from "@/hooks/features/saved/use-update-collection";
import type {
  CollectionPrivacy,
  SavedCollection,
} from "@/types/features/saved";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  accessToken: string;
  collection: SavedCollection | null;
  onClose: () => void;
}

export function EditCollectionDialog({
  accessToken,
  collection,
  onClose,
}: Props) {
  return (
    <Dialog open={Boolean(collection)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit collection</DialogTitle>
          <DialogDescription>
            Update the name, privacy or cover image of this collection.
          </DialogDescription>
        </DialogHeader>
        {collection && (
          <EditCollectionForm
            key={collection._id}
            accessToken={accessToken}
            collection={collection}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditCollectionForm({
  accessToken,
  collection,
  onClose,
}: {
  accessToken: string;
  collection: SavedCollection;
  onClose: () => void;
}) {
  const [name, setName] = useState(collection.name);
  const [privacy, setPrivacy] = useState<CollectionPrivacy>(collection.privacy);
  const [cover, setCover] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutate: update, isPending } = useUpdateCollection({ accessToken });

  const newCoverPreview = useMemo(
    () => (cover ? URL.createObjectURL(cover) : null),
    [cover],
  );

  useEffect(() => {
    if (!newCoverPreview) return;
    return () => URL.revokeObjectURL(newCoverPreview);
  }, [newCoverPreview]);

  const coverPreview = newCoverPreview || collection.coverImage?.url || null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    update(
      {
        collectionId: collection._id,
        name: name.trim(),
        privacy,
        coverImage: cover,
      },
      { onSuccess: (res) => res.success && onClose() },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-collection-name">Name</Label>
        <Input
          id="edit-collection-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-collection-privacy">Privacy</Label>
        <Select
          value={privacy}
          onValueChange={(v) => setPrivacy(v as CollectionPrivacy)}
        >
          <SelectTrigger id="edit-collection-privacy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Only me</SelectItem>
            <SelectItem value="friends">Friends</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Cover image</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (f) setCover(f);
          }}
        />
        {coverPreview ? (
          <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border">
            <Image
              src={coverPreview}
              alt="Cover preview"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[12px] text-white transition-colors hover:bg-black/80"
            >
              <ImagePlus className="size-3.5" />
              Replace
            </button>
            {cover && (
              <button
                type="button"
                onClick={() => setCover(null)}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                aria-label="Discard new image"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-32 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/60"
          >
            <ImagePlus className="size-5" />
            <span className="text-[13px]">Upload cover image</span>
          </button>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save changes
        </Button>
      </DialogFooter>
    </form>
  );
}
