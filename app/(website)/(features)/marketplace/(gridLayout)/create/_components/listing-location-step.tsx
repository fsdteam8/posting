"use client";

import { UseFormReturn } from "react-hook-form";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { CreateListingFormValues } from "./schema";

type Props = {
  form: UseFormReturn<CreateListingFormValues>;
  isPending: boolean;
  onBack: () => void;
};

export default function ListingLocationStep({
  form,
  isPending,
  onBack,
}: Props) {
  return (
    <div className="grid gap-5">
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
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1 rounded-full"
          onClick={onBack}
        >
          Back
        </Button>

        <Button
          type="submit"
          size="lg"
          className="flex-1 rounded-full"
          disabled={isPending}
        >
          Publish Listing
          {isPending && <Loader2 className="size-4 animate-spin" />}
        </Button>
      </div>
    </div>
  );
}
