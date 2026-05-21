"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { useUpdatePage } from "@/hooks/features/pages/use-update-page";
import type { Page } from "@/types/features/pages";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  PAGE_CATEGORIES,
  PAGE_HOURS_STATUSES,
  type PageHoursStatus,
} from "../../../_components/page-categories";

interface Props {
  page: Page;
  accessToken: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const schema = z.object({
  category: z.string().max(120, "Too long").optional().or(z.literal("")),
  bio: z.string().max(280, "Bio is too long").optional().or(z.literal("")),
  hoursStatus: z.enum(PAGE_HOURS_STATUSES),
  website: z
    .string()
    .trim()
    .max(200)
    .refine(
      (v) =>
        !v ||
        /^https?:\/\/.+/i.test(v) ||
        /^[\w.-]+\.[a-z]{2,}/i.test(v),
      "Enter a valid URL",
    )
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  postcode: z.string().trim().max(20).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function PageDetailsEditDialog({
  page,
  accessToken,
  open,
  onOpenChange,
}: Props) {
  const { mutateAsync: updatePage, isPending } = useUpdatePage({
    accessToken,
    pageId: page._id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: page.category ?? "",
      bio: page.bio ?? "",
      hoursStatus: (page.hours?.status as PageHoursStatus) ?? "No hours available",
      website: page.contact?.website ?? "",
      email: page.contact?.email ?? "",
      phone: page.contact?.phone ?? "",
      address: page.location?.address ?? "",
      city: page.location?.city ?? "",
      postcode: page.location?.postcode ?? "",
    },
  });

  // Reset when re-opened so cancelled edits don't persist
  useEffect(() => {
    if (open) {
      form.reset({
        category: page.category ?? "",
        bio: page.bio ?? "",
        hoursStatus:
          (page.hours?.status as PageHoursStatus) ?? "No hours available",
        website: page.contact?.website ?? "",
        email: page.contact?.email ?? "",
        phone: page.contact?.phone ?? "",
        address: page.location?.address ?? "",
        city: page.location?.city ?? "",
        postcode: page.location?.postcode ?? "",
      });
    }
  }, [open, page, form]);

  const onSubmit = async (values: FormValues) => {
    const website = values.website?.trim()
      ? /^https?:\/\//i.test(values.website)
        ? values.website
        : `https://${values.website}`
      : "";

    await updatePage({
      category: values.category || "",
      bio: values.bio || "",
      hours: { status: values.hoursStatus, details: page.hours?.details ?? {} },
      contact: {
        website,
        email: values.email || "",
        phone: values.phone || "",
      },
      location: {
        address: values.address || "",
        city: values.city || "",
        postcode: values.postcode || "",
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-center text-[17px]">
            Edit Page Details
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAGE_CATEGORIES.map((c) => (
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

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Short description shown on your page"
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hoursStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAGE_HOURS_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Contact info
              </p>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="hello@page.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 555 000 0000"
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Location</p>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input placeholder="Postcode" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
