"use client";

/**
 * SellerDetailClient — CLIENT COMPONENT
 *
 * Marketplace seller profile page. Shows a cover-image header with the
 * seller's avatar, rating, location, join date and action buttons, then
 * lists everything they currently have for sale in an infinite-scroll grid.
 *
 * Reached via the "View profile" link on SellerInfoCard inside the
 * listing detail page.
 */

import { Button } from "@/components/ui/button";
import { useBrowseListings } from "@/hooks/features/marketplace/api/use-browse-listing";
import { useGetSellerProfile } from "@/hooks/features/marketplace/api/use-get-seller-profile";
import type { MarketplaceListing } from "@/types/features/marketplace";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  Star,
  User,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { MarketplaceGrid } from "../../../(gridLayout)/_components/marketplace-grid";
import { SellerDetailSkeleton } from "./seller-detail-skeleton";

type Props = {
  sellerId: string;
  accessToken: string;
  currentUserId: string;
};

export function SellerDetailClient({
  sellerId,
  accessToken,
  currentUserId,
}: Props) {
  const router = useRouter();

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetSellerProfile({ sellerId, accessToken });

  const {
    data: listingsData,
    isLoading: isListingsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useBrowseListings({ sellerId, limit: 18 });

  const listings: MarketplaceListing[] =
    listingsData?.pages.flatMap((p) => p.data) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isProfileLoading) return <SellerDetailSkeleton />;

  if (isProfileError || !profileData?.data?.seller) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <AlertCircle className="w-10 h-10 text-red-300 mb-3" />
        <p className="text-[14px] font-semibold text-neutral-700">
          Seller not found
        </p>
        <p className="text-[12px] text-neutral-400 mt-1 mb-4">
          This seller may have removed their profile or no longer exists.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/marketplace")}
          className="gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const { seller, ratingSummary, viewer } = profileData.data;
  const fullName = `${seller.firstName} ${seller.lastName}`.trim();
  const livesIn =
    seller.currentCity ||
    [seller.location?.city, seller.location?.country]
      .filter(Boolean)
      .join(", ");
  const fromCity =
    seller.hometown ||
    [seller.location?.city, seller.location?.country]
      .filter(Boolean)
      .join(", ");
  const joinedDate = seller.createdAt
    ? format(new Date(seller.createdAt), "MMMM yyyy")
    : null;

  const isSelf = viewer?.isSelf || sellerId === currentUserId;
  const totalListings = listingsData?.pages[0]?.pagination.total ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 pb-12">
      {/* ── Back nav ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[12.5px] text-neutral-500 hover:text-neutral-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {/* ══ HEADER CARD ═══════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl bg-white border border-neutral-100 overflow-hidden mb-6">
        {/* Cover image */}
        <div className="relative w-full h-44 sm:h-56 lg:h-64 bg-neutral-100">
          {seller.coverImage?.url ? (
            <Image
              src={seller.coverImage.url}
              alt={`${fullName} cover`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100" />
          )}
        </div>

        {/* Avatar + info row */}
        <div className="relative px-4 sm:px-6 pb-5">
          {/* Avatar — sits over the cover image */}
          <div className="absolute -top-12 sm:-top-14 left-4 sm:left-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white bg-neutral-100">
            {seller.profileImage?.url ? (
              <Image
                src={seller.profileImage.url}
                alt={fullName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-neutral-300" />
              </div>
            )}
          </div>

          {/* Header content row — left for name, right for actions */}
          <div className="pt-14 sm:pt-16 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0 lg:pl-32">
              <h1 className="text-[22px] sm:text-[26px] font-bold text-neutral-900 leading-tight">
                {fullName}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(ratingSummary.avgRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[12.5px] font-medium text-neutral-700">
                  {ratingSummary.avgRating > 0
                    ? ratingSummary.avgRating.toFixed(1)
                    : "No ratings"}
                </span>
                {ratingSummary.totalRatings > 0 && (
                  <span className="text-[12px] text-neutral-400">
                    ({ratingSummary.totalRatings.toLocaleString()})
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[12.5px] text-neutral-500">
                {livesIn && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    Lives in {livesIn}
                  </span>
                )}
                {fromCity && fromCity !== livesIn && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    From {fromCity}
                  </span>
                )}
                {joinedDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    Joined on {joinedDate}
                  </span>
                )}
              </div>

              {seller.bio && (
                <p className="text-[13px] text-neutral-600 mt-3 leading-relaxed max-w-2xl">
                  {seller.bio}
                </p>
              )}
            </div>

            {/* Action buttons */}
            {!isSelf && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={viewer?.isFollowing ? "default" : "outline"}
                  className="h-9 gap-1.5 text-[12.5px] rounded-full px-4"
                  onClick={() => {
                    // Placeholder — follow/unfollow wiring lives in the
                    // shared user-follow hook used elsewhere in the app.
                    router.push(`/public/profile/${seller.username}`);
                  }}
                >
                  {viewer?.isFollowing ? (
                    <>
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1.5 text-[12.5px] rounded-full px-4"
                  onClick={() => router.push("/messenger")}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Message
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1.5 text-[12.5px] rounded-full px-4"
                  onClick={() =>
                    router.push(`/public/profile/${seller.username}`)
                  }
                >
                  <User className="w-3.5 h-3.5" />
                  View profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ LISTINGS ════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-neutral-800">
          {isSelf ? "Your listings" : `Listings by ${seller.firstName}`}
        </h2>

        {totalListings > 0 && (
          <span className="text-[11.5px] text-neutral-400">
            {totalListings.toLocaleString()} listing
            {totalListings === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <MarketplaceGrid
        listings={listings}
        isLoading={isListingsLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMore}
        onListingClick={(l) => router.push(`/marketplace/listing/${l._id}`)}
      />
    </div>
  );
}
