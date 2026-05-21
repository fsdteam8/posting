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
import { useCreateCollection } from "@/hooks/features/saved/use-create-collection";
import type { CollectionPrivacy } from "@/types/features/saved";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  accessToken: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCollectionDialog({
  accessToken,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create new collection</DialogTitle>
          <DialogDescription>
            Group your saved posts into a collection you can revisit later.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <CreateCollectionForm
            accessToken={accessToken}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateCollectionForm({
  accessToken,
  onClose,
}: {
  accessToken: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [privacy, setPrivacy] = useState<CollectionPrivacy>("private");
  const [cover, setCover] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutate: create, isPending } = useCreateCollection({ accessToken });

  const coverPreview = useMemo(
    () => (cover ? URL.createObjectURL(cover) : null),
    [cover],
  );

  useEffect(() => {
    if (!coverPreview) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    create(
      { name: name.trim(), privacy, coverImage: cover },
      { onSuccess: (res) => res.success && onClose() },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="collection-name">Name</Label>
        <Input
          id="collection-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Recipes, Travel ideas"
          maxLength={60}
          required
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="collection-privacy">Privacy</Label>
        <Select
          value={privacy}
          onValueChange={(v) => setPrivacy(v as CollectionPrivacy)}
        >
          <SelectTrigger id="collection-privacy">
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
        <Label>Cover image (optional)</Label>
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
              onClick={() => setCover(null)}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              aria-label="Remove cover"
            >
              <X className="size-4" />
            </button>
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
          Create
        </Button>
      </DialogFooter>
    </form>
  );
}
