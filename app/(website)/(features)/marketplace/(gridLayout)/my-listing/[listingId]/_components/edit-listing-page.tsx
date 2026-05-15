"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useGetListing } from "@/hooks/features/marketplace/api/use-get-listing-by-id";
import { useGetMarketplaceMeta } from "@/hooks/features/marketplace/api/use-get-marketplace-meta";
import { useUpdateListing } from "@/hooks/features/marketplace/api/use-update-listing";
import { cn } from "@/lib/utils";
import { editListingSchema, type EditListingFormValues } from "./schema";

const DELIVERY_OPTIONS = [
  { value: "local_pickup", label: "Local Pickup" },
  { value: "shipping", label: "Shipping" },
  { value: "door_drop", label: "Door Drop" },
  { value: "meetup", label: "Meetup" },
  { value: "local_delivery", label: "Local Delivery" },
];

type Props = {
  listingId: string;
  accessToken: string;
};

export default function EditListingPage({ listingId, accessToken }: Props) {
  const router = useRouter();

  const { data: metaData } = useGetMarketplaceMeta();
  const meta = metaData?.data;

  const { data: listingData, isLoading: isListingLoading } = useGetListing({
    listingId,
    accessToken,
  });

  const { mutateAsync: updateListing, isPending: isUpdating } = useUpdateListing({
    accessToken,
  });

  const listing = listingData?.data?.listing;
  const isReady = !isListingLoading && !!listing && !!metaData?.data;

  // ─── Initialize with empty defaults — real values are set via reset() below ───
  const form = useForm<EditListingFormValues>({
    resolver: zodResolver(editListingSchema) as unknown as Resolver<EditListingFormValues>,
    defaultValues: {
      title: "",
      description: "",
      listingType: "item",
      category: "",
      subcategory: "",
      condition: "not_applicable",
      price: 0,
      currency: "USD",
      isNegotiable: true,
      quantity: 1,
      hideFromFriends: false,
      listingStatus: "available",
      deliveryOptions: [],
      // ✅ Correct
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    mode: "onChange",
  });

  // ─── KEY FIX: reset() after both listing + meta are available ────────────────
  // Using the `values` prop on useForm does trigger resets internally, but
  // shadcn/ui Select components do NOT re-render their displayed value unless
  // the form field value changes via reset(). Calling reset() explicitly forces
  // all controlled inputs (including Selects) to reflect the new values.
  useEffect(() => {
    if (!isReady || !listing) return;

     // 👇 add this check first
  console.log("location data:", listing.location);

    form.reset({
      title: listing.title ?? "",
      description: listing.description ?? "",
      listingType: listing.listingType ?? "item",
      category: listing.category ?? "",
      subcategory: listing.subcategory ?? "",
      // Ensure the value matches a valid enum entry — fallback to "not_applicable"
      condition: listing.condition ?? "not_applicable",
      price: listing.price ?? 0,
      currency: listing.currency ?? "USD",
      isNegotiable: listing.isNegotiable ?? true,
      quantity: listing.quantity ?? 1,
      hideFromFriends: listing.hideFromFriends ?? false,
      listingStatus: listing.listingStatus ?? "available",
      deliveryOptions: listing.deliveryOptions ?? [],
      // ✅ Correct
address: listing.location?.address ?? "",
city:    listing.location?.city    ?? "",
state:   listing.location?.state   ?? "",
country: listing.location?.country ?? "",
postalCode: listing.location?.postalCode ?? "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]); // only run once when both listing + meta become ready

  async function onSubmit(values: EditListingFormValues) {
    const res = await updateListing({
      listingId,
      payload: {
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
    });

    if (res.success) {
      router.push("/marketplace/my-listing");
    }
  }

  if (!isReady) {
    return (
      <div className="flex min-h-[50vh] flex-col gap-4 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading listing data...</p>
      </div>
    );
  }



  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 pb-20">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/marketplace/my-listing">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Listing</h1>
          <p className="text-sm text-muted-foreground">
            Update the details of your marketplace listing.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-medium">Basic Details</h2>
              <p className="text-sm text-muted-foreground">
                The core information about what you&apos;re selling.
              </p>
            </div>

            <div className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="What are you selling?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="listingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(meta?.listingStatuses ?? []).map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} key={form.watch("category")}>
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

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} key={form.watch("condition")}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(meta?.conditions ?? []).map((c) => (
                            <SelectItem key={c} value={c} className="capitalize">
                              {c.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item in detail..."
                        className="min-h-32 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-medium">Delivery & Location</h2>
              <p className="text-sm text-muted-foreground">
                How and where buyers can get your item.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <FormLabel className="mb-3 block">Delivery Options</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <FormField
                      key={opt.value}
                      control={form.control}
                      name="deliveryOptions"
                      render={({ field }) => {
                        const checked = field.value?.includes(opt.value) ?? false;
                        return (
                          <FormItem
                            key={opt.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <label
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all",
                                checked
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-input hover:bg-accent hover:text-accent-foreground",
                              )}
                            >
                              <FormControl>
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
                              </FormControl>
                              <span className="text-sm font-medium leading-none">
                                {opt.label}
                              </span>
                            </label>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-5 pt-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. 123 Main St" {...field}  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. New York" {...field} />
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
                        <FormLabel>State / Province</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. United States" {...field} />
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
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. 10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-medium">Preferences</h2>
              <p className="text-sm text-muted-foreground">
                Configure privacy and negotiation settings.
              </p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="isNegotiable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Price is negotiable</FormLabel>
                      <FormDescription>
                        Allow buyers to make offers lower than your asking price.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hideFromFriends"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Hide from friends</FormLabel>
                      <FormDescription>
                        Your friends will not see this listing on their feeds.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 sticky bottom-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/marketplace/my-listing")}
              className="bg-background/80 backdrop-blur-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="min-w-32 shadow-lg"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}