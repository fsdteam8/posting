import * as z from "zod";

export const createListingSchema = z.object({
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

export type CreateListingFormValues = z.input<typeof createListingSchema>;

export type ParsedCreateListingFormValues = z.output<
  typeof createListingSchema
>;
