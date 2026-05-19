export const PAGE_CATEGORIES = [
  "Musician/Band",
  "Health/Beauty",
  "Supermarket/Convenience Store",
  "Restaurant/Café",
  "Clothing Store",
  "Education",
  "Technology",
  "Sports",
  "Entertainment",
  "Non-profit Organisation",
  "Local Business",
  "Community",
  "Arts & Entertainment",
  "Travel & Leisure",
  "Automotive",
] as const;

export const PAGE_HOURS_STATUSES = [
  "Always open",
  "Selected hours",
  "Permanently closed",
  "Temporarily closed",
  "No hours available",
] as const;

export type PageHoursStatus = (typeof PAGE_HOURS_STATUSES)[number];
