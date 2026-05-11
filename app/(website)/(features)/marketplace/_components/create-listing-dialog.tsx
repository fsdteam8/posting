"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

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

import { useCreateListing } from "@/hooks/features/marketplace/api/use-create-listing";
import { cn } from "@/lib/utils";
import { ListingType, MarketplaceMeta } from "@/types/features/marketplace";

import {
  Car,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
  Package,
  Tag,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),

  description: z.string().max(5000).optional(),

  listingType: z.enum([
    "item",
    "vehicle",
    "home_sale",
    "home_rent",
    "sale_event",
  ]),

  category: z.string().min(1, "Category is required"),

  subcategory: z.string().optional(),

  condition: z
    .enum(["new", "like_new", "good", "fair", "used", "not_applicable"])
    .optional(),

  price: z.coerce.number().min(0, "Price must be 0 or more"),

  currency: z.string().default("USD"),

  isNegotiable: z.boolean().default(true),

  quantity: z.coerce.number().min(1).default(1),

  hideFromFriends: z.boolean().default(false),

  deliveryOptions: z.array(z.string()).optional(),

  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

type FormValues = z.input<typeof schema>;
type ParsedFormValues = z.output<typeof schema>;

// ─────────────────────────────────────────────────────────
// Listing Types
// ─────────────────────────────────────────────────────────

const LISTING_TYPES: {
  value: ListingType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "item",
    label: "Item for sale",
    description: "Create a listing for an item to sell",
    icon: Package,
  },
  {
    value: "vehicle",
    label: "Vehicle for sale",
    description: "Cars, trucks, motorcycles, and more",
    icon: Car,
  },
  {
    value: "home_sale",
    label: "Property for sale",
    description: "List a house or property to sell",
    icon: Home,
  },
  {
    value: "home_rent",
    label: "Property for rent",
    description: "List a property to rent",
    icon: Home,
  },
  {
    value: "sale_event",
    label: "Sale event",
    description: "Garage sale, estate sale, etc.",
    icon: Tag,
  },
];

const DELIVERY_OPTIONS = [
  { value: "local_pickup", label: "Local Pickup" },
  { value: "shipping", label: "Shipping" },
  { value: "door_drop", label: "Door Drop" },
  { value: "meetup", label: "Meetup" },
  { value: "local_delivery", label: "Local Delivery" },
];

// ─────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta: MarketplaceMeta | undefined;
  accessToken: string;
};

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────

export default function CreateListingDialog({
  open,
  onOpenChange,
  meta,
  accessToken,
}: Props) {
  const [step, setStep] = useState<"type" | "form" | "location">("type");

  const { mutate, isPending } = useCreateListing({
    accessToken,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues, any, ParsedFormValues>({
    resolver: zodResolver(schema),

    defaultValues: {
      listingType: "item",
      isNegotiable: true,
      hideFromFriends: false,
      quantity: 1,
      currency: "USD",
      deliveryOptions: [],
    },

    mode: "onChange",
  });

  const selectedType = useWatch({
    control: form.control,
    name: "listingType",
  });

  function handleTypeSelect(type: ListingType) {
    form.setValue("listingType", type);
    setStep("form");
  }

  function handleClose() {
    onOpenChange(false);

    setTimeout(() => {
      form.reset();
      setStep("type");
    }, 300);
  }

  function onSubmit(values: ParsedFormValues) {
    mutate(
      {
        title: values.title,
        description: values.description,
        listingType: values.listingType,
        category: values.category,
        subcategory: values.subcategory,
        condition: values.condition,
        price: values.price,
        currency: values.currency,
        isNegotiable: values.isNegotiable,
        quantity: values.quantity,
        hideFromFriends: values.hideFromFriends,
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
      {
        onSuccess: (res) => {
          if (res.success) {
            handleClose();
          }
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-2">
            {step !== "type" && (
              <button
                type="button"
                onClick={() => setStep(step === "location" ? "form" : "type")}
                className="rounded-full p-1 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}

            <DialogTitle className="text-xl font-bold">
              {step === "type"
                ? "Choose listing type"
                : step === "form"
                  ? "Create listing"
                  : "Add location"}
            </DialogTitle>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {step === "type"
              ? "Select the type of listing you want to create"
              : step === "form"
                ? "Add listing details"
                : "Help buyers find your listing"}
          </p>

          {/* Step Indicator */}
          <div className="mt-4 flex items-center gap-2">
            {["type", "form", "location"].map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  step === s
                    ? "w-8 bg-primary"
                    : ["type", "form", "location"].indexOf(step) > i
                      ? "w-6 bg-primary/40"
                      : "w-6 bg-muted",
                )}
              />
            ))}
          </div>
        </DialogHeader>

        {/* STEP 1 */}
        {step === "type" && (
          <div className="grid gap-3 p-6">
            {LISTING_TYPES.map((lt) => (
              <button
                key={lt.value}
                type="button"
                onClick={() => handleTypeSelect(lt.value)}
                className="group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
                  <lt.icon className="size-5 text-muted-foreground group-hover:text-primary" />
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{lt.label}</h4>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {lt.description}
                  </p>
                </div>

                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 */}
        {step === "form" && (
          <Form {...form}>
            <form className="grid gap-5 px-6 py-5">
              {/* Title */}
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

              {/* Price + Currency */}
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
                          value={field.value?.toString() ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : "",
                            )
                          }
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

                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {["USD", "EUR", "GBP", "CAD", "AUD"].map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>

                    <Select onValueChange={field.onChange} value={field.value}>
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

              {/* Condition */}
              {selectedType !== "home_sale" && selectedType !== "home_rent" && (
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {(meta?.conditions ?? []).map((c) => (
                            <SelectItem
                              key={c}
                              value={c}
                              className="capitalize"
                            >
                              {c.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Description */}
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
                        className="resize-none"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Options */}
              <div className="space-y-3">
                <FormLabel>Delivery options</FormLabel>

                <div className="grid grid-cols-2 gap-3">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <FormField
                      key={opt.value}
                      control={form.control}
                      name="deliveryOptions"
                      render={({ field }) => {
                        const checked =
                          field.value?.includes(opt.value) ?? false;

                        return (
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors",
                              checked
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted",
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
                            />

                            {opt.label}
                          </label>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="isNegotiable"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      Price is negotiable
                    </label>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hideFromFriends"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      Hide from friends
                    </label>
                  )}
                />
              </div>

              {/* Action */}
              <Button
                type="button"
                size="lg"
                className="h-11 rounded-full"
                onClick={() => setStep("location")}
              >
                Next: Location
                <ChevronRight className="size-4" />
              </Button>
            </form>
          </Form>
        )}

        {/* STEP 3 */}
        {step === "location" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-5 px-6 py-5"
            >
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>

                    <FormControl>
                      <Input {...field} placeholder="Street address" />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>

                      <FormControl>
                        <Input {...field} placeholder="City" />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>

                      <FormControl>
                        <Input {...field} placeholder="State" />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>

                      <FormControl>
                        <Input {...field} placeholder="Country" />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code</FormLabel>

                      <FormControl>
                        <Input {...field} placeholder="Postal code" />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 flex-1 rounded-full"
                  onClick={() => setStep("form")}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 flex-1 rounded-full"
                  disabled={isPending}
                >
                  Publish Listing
                  {isPending && <Loader2 className="size-5 animate-spin" />}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
