import { Car, Home, Package, Tag } from "lucide-react";

import { ListingType } from "@/types/features/marketplace";

export const LISTING_TYPES: {
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

export const DELIVERY_OPTIONS = [
  { value: "local_pickup", label: "Local Pickup" },
  { value: "shipping", label: "Shipping" },
  { value: "door_drop", label: "Door Drop" },
  { value: "meetup", label: "Meetup" },
  { value: "local_delivery", label: "Local Delivery" },
];
