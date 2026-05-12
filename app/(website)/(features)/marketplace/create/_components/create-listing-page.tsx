"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";

import { useCreateListing } from "@/hooks/features/marketplace/api/use-create-listing";

import { ListingType } from "@/types/features/marketplace";

import ListingDetailsStep from "./listing-details-step";
import ListingLocationStep from "./listing-location-step";
import ListingTypeStep from "./listing-type-step";

import { useGetMarketplaceMeta } from "@/hooks/features/marketplace/api/use-get-marketplace-meta";
import { useRouter } from "nextjs-toploader/app";
import {
  CreateListingFormValues,
  createListingSchema,
  ParsedCreateListingFormValues,
} from "./schema";

type Props = {
  accessToken: string;
};

export default function CreateListingPage({ accessToken }: Props) {
  const [step, setStep] = useState<"type" | "details" | "location">("type");

  const router = useRouter();

  const { data } = useGetMarketplaceMeta();

  const meta = data?.data;

  const { mutateAsync, isPending } = useCreateListing({
    accessToken,
  });

  const form = useForm<
    CreateListingFormValues,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    ParsedCreateListingFormValues
  >({
    resolver: zodResolver(createListingSchema),

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

  function handleTypeSelect(type: ListingType) {
    form.setValue("listingType", type);
    setStep("details");
  }

  async function onSubmit(values: ParsedCreateListingFormValues) {
    const res = await mutateAsync({
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
    });

    if (!res.success) return;

    router.push("/marketplace/my-listing");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Create Listing</h1>

        <p className="mt-2 text-muted-foreground">
          Create a marketplace listing and start selling.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {["type", "details", "location"].map((s, i) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              step === s
                ? "w-10 bg-primary"
                : ["type", "details", "location"].indexOf(step) > i
                  ? "w-8 bg-primary/40"
                  : "w-8 bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="rounded-3xl border bg-background p-6 shadow-sm">
        {step === "type" && <ListingTypeStep onSelect={handleTypeSelect} />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {step === "details" && (
              <ListingDetailsStep
                form={form}
                meta={meta}
                onNext={() => setStep("location")}
              />
            )}

            {step === "location" && (
              <ListingLocationStep
                form={form}
                isPending={isPending}
                onBack={() => setStep("details")}
              />
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
