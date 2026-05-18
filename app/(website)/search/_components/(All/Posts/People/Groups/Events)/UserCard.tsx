"use client";

import { useGetAllFriends } from "@/hooks/features/friends/use-get-all-friends";
import { useGetSentRequests } from "@/hooks/features/friends/use-get-sent-requests";
import { useSendFriendRequest } from "@/hooks/features/friends/use-send-friend-request";
import { SearchUser } from "@/types/features/search/types";
import { Check, Loader2, UserCheck, UserPlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";

type Props = {
  user: SearchUser;
  accessToken: string;
  loggedinUserId: string;
};

type FriendshipStatus = "none" | "request_sent" | "friends";

export default function UserCard({ user, accessToken, loggedinUserId }: Props) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const avatarUrl = user.profileImage?.url;
  const router = useRouter();

  const isOwner = user._id === loggedinUserId;

  // ── Fetch both lists — React Query caches them so no duplicate calls
  // across multiple UserCard instances on the same page ──────────────────────
  const { data: allFriendsData, isLoading: loadingFriends } = useGetAllFriends({
    accessToken,
    page: 1,
    limit: 500, // fetch enough to cover all friends in one shot
  });

  const { data: sentRequestsData, isLoading: loadingSent } = useGetSentRequests(
    { accessToken },
  );

  // ── Derive status from fetched data ───────────────────────────────────────

  const isFriend =
    allFriendsData?.data?.some((f) => f._id === user._id) ?? false;

  const hasPendingRequest =
    sentRequestsData?.data?.some(
      (r) => r.recipient._id === user._id && r.status === "pending",
    ) ?? false;

  const derivedStatus: FriendshipStatus = isFriend
    ? "friends"
    : hasPendingRequest
      ? "request_sent"
      : "none";

  // Local override only after user takes action in this session
  const [localOverride, setLocalOverride] = useState<FriendshipStatus | null>(
    null,
  );

  const friendshipStatus = localOverride ?? derivedStatus;
  const isResolving = loadingFriends || loadingSent;

  // ── Mutation ──────────────────────────────────────────────────────────────

  const { mutate: sendRequest, isPending } = useSendFriendRequest({
    accessToken,
  });

  const handleAddFriend = () => {
    if (friendshipStatus !== "none" || isPending || isOwner) return;

    sendRequest(
      { receiverId: user._id },
      {
        onSuccess: (res) => {
          if (res.success) setLocalOverride("request_sent");
        },
      },
    );
  };

  const onProfileGo = () => {
    router.push(`/public/profile/${user.username}`);
  };

  // ── Button config ─────────────────────────────────────────────────────────

  const getButtonConfig = () => {
    if (isResolving)
      return {
        icon: <Loader2 size={14} className="animate-spin" />,
        label: "Loading...",
        className: "bg-gray-100 text-gray-400 cursor-not-allowed",
      };
    if (isPending)
      return {
        icon: <Loader2 size={14} className="animate-spin" />,
        label: "Sending...",
        className: "bg-[#E7F3FF] text-[#1877F2] opacity-70 cursor-not-allowed",
      };
    if (friendshipStatus === "friends")
      return {
        icon: <UserCheck size={14} />,
        label: "Friends",
        className: "bg-[#E7F3FF] text-[#42B72A] cursor-default",
      };
    if (friendshipStatus === "request_sent")
      return {
        icon: <Check size={14} />,
        label: "Request Sent",
        className: "bg-[#E7F3FF] text-[#42B72A] cursor-default",
      };
    return {
      icon: <UserPlus size={14} />,
      label: "Add Friend",
      className:
        "bg-[#E7F3FF] text-[#1877F2] hover:bg-[#1877F2] hover:text-white",
    };
  };

  const btn = getButtonConfig();

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E4E6EB] hover:shadow-sm transition-shadow">
      {/* Avatar */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image
              src={user.profileImage.url}
              alt={fullName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#1877F2] to-[#42B72A] flex items-center justify-center text-white text-lg font-bold border-2 border-[#E4E6EB]">
            {user.firstName.charAt(0)}
          </div>
        )}
        {user.isOnline && (
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#42B72A] rounded-full border-2 border-white" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-[#1C1E21] text-sm truncate cursor-pointer hover:text-primary"
          onClick={onProfileGo}
        >
          {fullName}
        </p>
        <p className="text-xs text-[#65676B] truncate">@{user.username}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex -space-x-1.5">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="w-5 h-5 rounded-full bg-linear-to-br from-gray-200 to-gray-300 border border-white"
              />
            ))}
          </div>
          <span className="text-[11px] text-[#65676B]">
            {user.followers.length} mutual friends
          </span>
        </div>
      </div>

      {/* Action button — hidden for own card */}
      {!isOwner && (
        <button
          onClick={handleAddFriend}
          disabled={isPending || isResolving || friendshipStatus !== "none"}
          className={[
            "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed whitespace-nowrap",
            btn.className,
          ].join(" ")}
        >
          {btn.icon}
          {btn.label}
        </button>
      )}
    </div>
  );
}
