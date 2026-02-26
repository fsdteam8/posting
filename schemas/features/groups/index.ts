import { z } from "zod";

export const groupFormSchema = z.object({
  name: z
    .string()
    .min(2, "Group name must be at least 2 characters")
    .max(100, "Group name must be less than 100 characters"),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  privacy: z.enum(["private", "public"]),

  category: z.string().min(1, "Please select a category"),

  coverImage: z.any().optional(),
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;
