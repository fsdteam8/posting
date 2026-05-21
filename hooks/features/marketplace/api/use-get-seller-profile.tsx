import { baseURL } from "@/constants";
import type { MarketplaceMedia } from "@/types/features/marketplace";
import { useQuery } from "@tanstack/react-query";

export type SellerProfile = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: MarketplaceMedia;
  coverImage: MarketplaceMedia;
  bio: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  currentCity: string;
  hometown: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  totalFriends: number;
};

export type SellerRatingSummary = {
  avgRating: number;
  totalRatings: number;
  totalSold: number;
};

export type SellerViewerState = {
  isSelf: boolean;
  isFriend: boolean;
  isFollowing: boolean;
};

type GetSellerProfileData = {
  seller: SellerProfile;
  ratingSummary: SellerRatingSummary;
  viewer: SellerViewerState;
};

type GetSellerProfileResponse = {
  success: boolean;
  message: string;
  data: GetSellerProfileData;
};

type Params = {
  sellerId: string | null;
  accessToken?: string;
};

export function useGetSellerProfile({ sellerId, accessToken }: Params) {
  return useQuery<GetSellerProfileResponse, Error>({
    queryKey: ["marketplace", "seller", sellerId],

    queryFn: async () => {
      const res = await fetch(`${baseURL}/marketplace/seller/${sellerId}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          message = body?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return res.json();
    },

    enabled: !!sellerId,
    staleTime: 1000 * 60 * 2,
  });
}
