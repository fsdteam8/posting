import { createListingSchema } from "@/app/(website)/(features)/marketplace/create/_components/schema";
import * as z from "zod";

export const editListingSchema = createListingSchema.extend({
  listingStatus: z
    .enum(["available", "pending", "sold", "shipped", "archived"])
    .optional(),
});

export type EditListingFormValues = z.infer<typeof editListingSchema>;
