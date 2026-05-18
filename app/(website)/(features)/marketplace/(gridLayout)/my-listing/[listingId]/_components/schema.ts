import * as z from "zod";
import { createListingSchema } from "../../../create/_components/schema";

export const editListingSchema = createListingSchema.extend({
  listingStatus: z
    .enum(["available", "pending", "sold", "shipped", "archived"])
    .optional(),
});

export type EditListingFormValues = z.infer<typeof editListingSchema>;
