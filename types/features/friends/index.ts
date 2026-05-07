export type ProfileImage = {
  public_id: string;
  url: string;
};

export type NonFriend = {
  _id: string;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: ProfileImage;
  followers: string[];
  username: string;
  mutualFriendsCount: number;
  totalScore: number;
  mutualFriends: string[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type NonFriendsApiRes = {
  success: boolean;
  message: string;
  data: NonFriend[];
  pagination: Pagination;
};

// ── Friend Requests ──────────────────────────────────────────

export type FriendRequestUser = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: ProfileImage;
};

export type FriendRequest = {
  _id: string;
  requester: FriendRequestUser;
  recipient: FriendRequestUser;
  status: "pending" | "accepted" | "declined" | "cancelled";
  blockedBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type FriendRequestsApiRes = {
  success: boolean;
  message: string;
  data: FriendRequest[];
};

export type RespondFriendRequestPayload = {
  requestId: string;
  action: "accept" | "decline";
};

export type RespondFriendRequestApiRes = {
  success: boolean;
  message: string;
  data?: unknown;
};

// ── All Friends ──────────────────────────────────────────────

export type Friend = {
  _id: string;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: ProfileImage;
  followers: string[];
  isOnline: boolean;
  lastActiveAt: string;
  username: string;
  mutualFriendsCount: number;
  mutualFriends: string[];
};

export type AllFriendsMeta = {
  totalFriends: number;
};

export type AllFriendsApiRes = {
  success: boolean;
  message: string;
  data: Friend[];
  meta: AllFriendsMeta;
  pagination: Pagination;
};

export type UnfriendApiRes = {
  success: boolean;
  message: string;
  data: {
    friendId: string;
  };
};

// ── Sent Requests ────────────────────────────────────────────

export type SentRequestsApiRes = {
  success: boolean;
  message: string;
  data: FriendRequest[];
};

export type CancelFriendRequestApiRes = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    requester: string;
    recipient: string;
    status: "cancelled";
    blockedBy: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};

// ── Suggestions ──────────────────────────────────────────────

export type Suggestion = {
  _id: string;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: ProfileImage;
  followers: string[];
  username: string;
};

export type SuggestionsApiRes = {
  success: boolean;
  message: string;
  data: Suggestion[];
};
