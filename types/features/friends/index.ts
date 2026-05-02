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
