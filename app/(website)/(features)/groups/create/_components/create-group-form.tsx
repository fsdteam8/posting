"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { groupFormSchema, GroupFormValues } from "@/schemas/features/groups";
import { Loader2 } from "lucide-react";
import { ImageUploadField } from "./image-upload-field";
import { CategorySelect, PrivacySelect } from "./select-option";

interface CreateGroupFormProps {
  onSuccess?: (data: GroupFormValues) => void;
  onFormChange?: (data: Partial<GroupFormValues>) => void;
  isLoading?: boolean;
}

export function CreateGroupForm({
  onSuccess,
  onFormChange,
  isLoading = false,
}: CreateGroupFormProps) {
  const [imageError, setImageError] = useState<string | null>(null);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "private",
      category: "Technology",
      coverImage: null,
    },
    mode: "onChange",
  });

  const coverImage = useWatch({
    name: "coverImage",
    control: form.control,
  });

  // Notify parent of every change for real-time preview
  const notifyChange = (patch: Partial<GroupFormValues>) => {
    onFormChange?.({ ...form.getValues(), ...patch });
  };

  const onSubmit = async (data: GroupFormValues) => {
    setImageError(null);
    try {
      onSuccess?.(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleImageChange = (file: File | null) => {
    form.setValue("coverImage", file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (file) {
      if (file.size > 5 * 1024 * 1024)
        return setImageError("Image must be less than 5MB");
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
        return setImageError("Only JPG, PNG, and WebP images are allowed");
    }
    setImageError(null);
    notifyChange({ coverImage: file });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Web Developers"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    notifyChange({ name: e.target.value });
                  }}
                  disabled={isLoading}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your group (optional)"
                  className="resize-none"
                  rows={3}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    notifyChange({ description: e.target.value });
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                {(field.value ?? "").length} / 500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy</FormLabel>
              <FormControl>
                <PrivacySelect
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    notifyChange({
                      privacy: val as GroupFormValues["privacy"],
                    });
                  }}
                  placeholder="Choose privacy"
                />
              </FormControl>
              <FormDescription>
                {field.value === "private"
                  ? "Only members can see who's in the group and what they post."
                  : "Anyone can find this group."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategorySelect
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    notifyChange({ category: val });
                  }}
                  placeholder="Select category"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={() => (
            <FormItem>
              <FormLabel>Cover image</FormLabel>
              <FormControl>
                <ImageUploadField
                  value={coverImage}
                  onChange={handleImageChange}
                  error={
                    imageError ??
                    String(form.formState.errors.coverImage?.message ?? "")
                  }
                />
              </FormControl>
              <FormDescription>
                Upload a cover image for your group
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || !form.formState.isDirty}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating group...
            </>
          ) : (
            "Create group"
          )}
        </Button>
      </form>
    </Form>
  );
}
