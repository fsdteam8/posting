import { Pagination } from "@/types";

export interface GetSingleGroupResponse {
  success: boolean;
  message: string;
  data: Group;
}

export interface GetGroupMembersResponse {
  success: boolean;
  message: string;
  data: GroupUser[];
}

export interface CreateGroupPostResponse {
  success: boolean;
  message: string;
}

// get response for
export interface GroupsResponse {
  success: boolean;
  message: string;
  data: Group[];
  pagination: Pagination;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  category: string;
  privacy: "public" | "private" | "closed";

  rules: GroupRule[];

  // ✅ new fields
  location: string; // default: ""
  website: string; // default: ""
  whoCanPost: "anyone" | "admins"; // default: "anyone"
  postApprovalRequired: boolean; // default: false
  whoCanInvite: "anyone" | "admins"; // default: "anyone"
  discoverability: "visible" | "hidden"; // default: "visible"

  pendingMembers: GroupUser[];
  members: GroupUser[];
  admins: GroupUser[];

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;

  groupUserName: string;
  memberMeta: MemberMeta[];
  currentUserMeta: CurrentUserMeta;

  coverImage: {
    url: string;
    public_id: string;
  };
}

export type GroupRule = {
  _id: string;
  title: string;
  description: string;
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export interface GroupUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: ProfileImage;
}

export interface ProfileImage {
  public_id: string;
  url: string;
}

export interface MemberMeta {
  user: string; // user ID reference
  lastVisitedAt: string; // ISO date string
  isPinned: boolean;
  pinnedAt: string; // ISO date string
}

export interface CurrentUserMeta {
  lastVisitedAt: string; // ISO date string
  isPinned: boolean;
  pinnedAt: string; // ISO date string
}
