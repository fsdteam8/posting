"use client";

import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { MarketplaceMeta } from "@/types/features/marketplace";

import { ChevronRight } from "lucide-react";

import { DELIVERY_OPTIONS } from "./constants";
import { CreateListingFormValues } from "./schema";

// ── Media uploader ─────────────────────────────────────────────────────────────
// Imported here so the photo/video section sits naturally inside the details step
// rather than floating outside the form card.
import { ListingMediaUploader, type PhotoFile } from "./listing-media-uploader";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  form: UseFormReturn<CreateListingFormValues>;
  meta: MarketplaceMeta | undefined;
  // Media state is lifted to CreateListingPage so it survives step navigation
  // and is available when onSubmit builds the FormData payload.
  photos: PhotoFile[];
  onPhotosChange: (photos: PhotoFile[]) => void;
  video: File | null;
  onVideoChange: (video: File | null) => void;
  onNext: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListingDetailsStep({
  form,
  meta,
  photos,
  onPhotosChange,
  video,
  onVideoChange,
  onNext,
}: Props) {
  const selectedType = form.watch("listingType");

  return (
    <div className="grid gap-5">
      {/* ── Media uploader ────────────────────────────────────────────────── */}
      {/* Sits at the top — matches Figma where photos are the first thing
          a seller adds. State is owned by the parent so files survive when
          the user navigates back from the location step.                    */}
      <div className="space-y-1">
        <ListingMediaUploader
          photos={photos}
          onPhotosChange={onPhotosChange}
          video={video}
          onVideoChange={onVideoChange}
        />
      </div>

      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="What are you selling?" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Price + Currency ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={String(field.value ?? "")}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["USD", "EUR", "GBP"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      {/* ── Category ──────────────────────────────────────────────────────── */}
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {(meta?.categories ?? []).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Condition — hidden for property listing types ─────────────────── */}
      {selectedType !== "home_sale" && selectedType !== "home_rent" && (
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(meta?.conditions ?? []).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}

      {/* ── Description ───────────────────────────────────────────────────── */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={4}
                placeholder="Describe your item..."
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* ── Delivery options ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <FormLabel>Delivery options</FormLabel>
        <div className="grid grid-cols-2 gap-3">
          {DELIVERY_OPTIONS.map((opt) => (
            <FormField
              key={opt.value}
              control={form.control}
              name="deliveryOptions"
              render={({ field }) => {
                const checked = field.value?.includes(opt.value) ?? false;
                return (
                  <label className="flex items-center gap-2 rounded-xl border p-3 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const current = field.value ?? [];
                        field.onChange(
                          v
                            ? [...current, opt.value]
                            : current.filter((x) => x !== opt.value),
                        );
                      }}
                    />
                    {opt.label}
                  </label>
                );
              }}
            />
          ))}
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className="h-11 rounded-full"
        onClick={onNext}
      >
        Next: Location
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
