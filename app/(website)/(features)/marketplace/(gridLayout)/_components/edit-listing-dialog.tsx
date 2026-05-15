"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
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
import { useUpdateListing } from "@/hooks/features/marketplace/api/use-update-listing";
import { cn } from "@/lib/utils";
import {
  MarketplaceListing,
  MarketplaceMeta,
} from "@/types/features/marketplace";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().max(5000).optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  condition: z
    .enum(["new", "like_new", "good", "fair", "used", "not_applicable"])
    .optional(),
  price: z.coerce.number().min(0),
  currency: z.string().default("USD"),
  isNegotiable: z.boolean().default(true),
  hideFromFriends: z.boolean().default(false),
  listingStatus: z
    .enum(["available", "pending", "sold", "shipped", "archived"])
    .optional(),
  deliveryOptions: z.array(z.string()).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const DELIVERY_OPTIONS = [
  { value: "local_pickup", label: "Local Pickup" },
  { value: "shipping", label: "Shipping" },
  { value: "door_drop", label: "Door Drop" },
  { value: "meetup", label: "Meetup" },
  { value: "local_delivery", label: "Local Delivery" },
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: MarketplaceListing | null;
  meta: MarketplaceMeta | undefined;
  accessToken: string;
};

export function EditListingDialog({
  open,
  onOpenChange,
  listing,
  meta,
  accessToken,
}: Props) {
  const { mutate, isPending } = useUpdateListing({ accessToken });

  const form = useForm<FormValues>({
    // zodResolver's inferred types can sometimes be incompatible with useForm generics,
    // cast to the proper Resolver<FormValues> to satisfy TS.
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
  });

  useEffect(() => {
    if (listing) {
      form.reset({
        title: listing.title,
        description: listing.description,
        category: listing.category,
        subcategory: listing.subcategory,
        condition: listing.condition,
        price: listing.price,
        currency: listing.currency,
        isNegotiable: listing.isNegotiable,
        hideFromFriends: listing.hideFromFriends,
        listingStatus: listing.listingStatus,
        deliveryOptions: listing.deliveryOptions,
        address: listing.location?.address,
        city: listing.location?.city,
        state: listing.location?.state,
        country: listing.location?.country,
        postalCode: listing.location?.postalCode,
      });
    }
  }, [listing, form]);

  function onSubmit(values: FormValues) {
    if (!listing) return;
    mutate(
      {
        listingId: listing._id,
        payload: {
          title: values.title,
          description: values.description,
          category: values.category,
          subcategory: values.subcategory,
          condition: values.condition,
          price: values.price,
          currency: values.currency,
          isNegotiable: values.isNegotiable,
          hideFromFriends: values.hideFromFriends,
          listingStatus: values.listingStatus,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          deliveryOptions: values.deliveryOptions as any,
          location: {
            address: values.address,
            city: values.city,
            state: values.state,
            country: values.country,
            postalCode: values.postalCode,
          },
        },
      },
      {
        onSuccess: (res) => {
          if (res.success) onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-neutral-100">
          <DialogTitle className="text-[14px] font-semibold">
            Edit listing
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-5 py-4 space-y-3"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-medium text-neutral-700">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-8 text-[13px]" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-medium text-neutral-700">
                      Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="h-8 text-[13px]"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="listingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-medium text-neutral-700">
                      Status
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(meta?.listingStatuses ?? []).map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-[12.5px] capitalize"
                          >
                            {s.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-medium text-neutral-700">
                    Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(meta?.categories ?? []).map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="text-[12.5px]"
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-medium text-neutral-700">
                    Condition
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(meta?.conditions ?? []).map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="text-[12.5px] capitalize"
                        >
                          {c.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-medium text-neutral-700">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="resize-none text-[13px] min-h-18"
                      rows={3}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <p className="text-[12px] font-medium text-neutral-700 mb-1.5">
                Delivery options
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {DELIVERY_OPTIONS.map((opt) => (
                  <FormField
                    key={opt.value}
                    control={form.control}
                    name="deliveryOptions"
                    render={({ field }) => {
                      const checked = field.value?.includes(opt.value) ?? false;
                      return (
                        <label
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-colors text-[12px]",
                            checked
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-neutral-100 text-neutral-600 hover:bg-neutral-50",
                          )}
                        >
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
                            className="w-3.5 h-3.5"
                          />
                          {opt.label}
                        </label>
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-medium text-neutral-700">
                      City
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-8 text-[13px]" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-medium text-neutral-700">
                      State
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-8 text-[13px]" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-[12.5px]"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-[12.5px]"
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
