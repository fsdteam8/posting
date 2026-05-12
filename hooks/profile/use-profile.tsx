import { baseURL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

interface ProfileImage {
  public_id: string;
  url: string;
}

interface Location {
  city: string;
  state: string;
  country: string;
}

interface LocationGeo {
  type: string;
  coordinates: number[];
}

interface PrivacySettings {
  profileVisibility: string;
  whoCanFollow: string;
  whoCanSendFriendRequest: string;
}

export interface Education {
  _id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  from: Date;
  to: Date;
  current: boolean;
}

export interface Work {
  _id?: string;
  title: string;
  company: string;
  location: string;
  from: Date;
  to: Date;
  current: boolean;
  description: string;
}

export interface SocialUrl {
  platform: string;
  url: string;
}

export interface Profile {
  _id: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  username: string;
  bio: string;
  dob: string;
  gender: string;
  website: string;
  currentCity: string;
  hometown: string;
  relationshipStatus: string;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  isOnline: boolean;
  accountStatus: string;
  profileImage: ProfileImage;
  coverImage: ProfileImage;
  location: Location;
  locationGeo: LocationGeo;
  privacySettings: PrivacySettings;
  interests: string[];
  hobbies: string[];
  languages: string[];
  skills: string[];
  works: Work[];
  socialLinks: SocialUrl[];
  education: Education[];
  blockedUsers: string[];
  followers: string[];
  following: string[];
  fuzzy_tokens: string[];
  totalFriends: number;
  totalPost: number;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  refreshToken: string;
  __v: number;
}

export function useProfile(accessToken: string) {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: () =>
      fetch(`${baseURL}/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then((res) => res.data),
  });
}
