// ─── Media & Sub-schemas ────────────────────────────────────────────────────

export type MarketplaceMedia = {
  url: string;
  public_id: string;
};

export type MarketplaceVideo = {
  url: string;
  public_id: string;
  thumbnail: string;
  duration: number;
};

export type MarketplaceLocation = {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type MarketplaceLocationGeo = {
  type: "Point";
  coordinates: [number, number];
};

export type MarketplaceReport = {
  user: string;
  reason: string;
  details: string;
  createdAt: string;
};

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ListingType =
  | "item"
  | "vehicle"
  | "home_sale"
  | "home_rent"
  | "sale_event";

export type ListingCondition =
  | "new"
  | "like_new"
  | "good"
  | "fair"
  | "used"
  | "not_applicable";

export type DeliveryOption =
  | "local_pickup"
  | "shipping"
  | "door_drop"
  | "meetup"
  | "local_delivery";

export type ListingStatus =
  | "available"
  | "pending"
  | "sold"
  | "shipped"
  | "archived";

export type ListingVisibility = "public" | "friends";

// ─── Seller ──────────────────────────────────────────────────────────────────

export type ListingSeller = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: MarketplaceMedia;
};

// ─── Listing ─────────────────────────────────────────────────────────────────

export type MarketplaceListing = {
  _id: string;
  seller: ListingSeller | string;
  title: string;
  description: string;
  listingType: ListingType;
  category: string;
  subcategory: string;
  condition: ListingCondition;
  price: number;
  currency: string;
  isNegotiable: boolean;
  quantity: number;
  photos: MarketplaceMedia[];
  video?: MarketplaceVideo;
  deliveryOptions: DeliveryOption[];
  shippingEligible: boolean;
  listingStatus: ListingStatus;
  visibility: ListingVisibility;
  hideFromFriends: boolean;
  location: MarketplaceLocation;
  locationGeo: MarketplaceLocationGeo;
  tags: string[];
  attributes: Record<string, unknown>;
  saves: string[];
  hiddenBy: string[];
  viewsCount: number;
  savesCount: number;
  offersCount: number;
  reportCount: number;
  reports: MarketplaceReport[];
  soldTo: string | null;
  soldAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

// ─── API Responses ───────────────────────────────────────────────────────────

export type MarketplaceMeta = {
  listingTypes: ListingType[];
  conditions: ListingCondition[];
  deliveryOptions: DeliveryOption[];
  listingStatuses: ListingStatus[];
  categories: string[];
};

export type MarketplaceMetaResponse = {
  success: boolean;
  message: string;
  data: MarketplaceMeta;
};

export type MarketplaceListingResponse = {
  success: boolean;
  message: string;
  data: MarketplaceListing;
};

export type MarketplaceMyListingsResponse = {
  success: boolean;
  message: string;
  data: MarketplaceListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// ─── Create Listing Form ─────────────────────────────────────────────────────

export type CreateListingPayload = {
  title: string;
  description?: string;
  listingType: ListingType;
  category: string;
  subcategory?: string;
  condition?: ListingCondition;
  price: number;
  currency?: string;
  isNegotiable?: boolean;
  quantity?: number;
  deliveryOptions?: DeliveryOption[];
  shippingEligible?: boolean;
  listingStatus?: ListingStatus;
  visibility?: ListingVisibility;
  hideFromFriends?: boolean;
  location?: Partial<MarketplaceLocation>;
  locationGeo?: MarketplaceLocationGeo;
  tags?: string[];
  attributes?: Record<string, unknown>;
};

export type UpdateListingPayload = Partial<CreateListingPayload>;

// ─── Browse listings ──────────────────────────────────────────────────────────

export type SortBy = "recent" | "price_asc" | "price_desc";

export type BrowseListingsParams = {
  limit?: number;
  q?: string; // full-text search query
  category?: string; // filter by category string
  sortBy?: SortBy;
  sellerId?: string; // restrict results to a specific seller
};

export type BrowseListingsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

// Single page shape — matches what the API returns per request.
// useInfiniteQuery receives one of these per page fetch.
export type BrowseListingsPage = {
  success: boolean;
  message: string;
  data: MarketplaceListing[];
  pagination: BrowseListingsPagination;
};
