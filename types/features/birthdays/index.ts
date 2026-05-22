import type { ProfileImage } from "@/types/features/friends";

export type BirthdayFriend = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: ProfileImage;
  /** ISO date string */
  dob: string;
};

export type BirthdayListApiRes = {
  success: boolean;
  message: string;
  data: BirthdayFriend[];
};

export type BirthdaySummary = {
  total: number;
  preview: BirthdayFriend[];
};

export type BirthdaySummaryApiRes = {
  success: boolean;
  message: string;
  data: BirthdaySummary;
};
