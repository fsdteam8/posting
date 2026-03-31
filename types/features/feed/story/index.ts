// types/features/feed/story/index.ts

import { ReactionType } from "@/components/shared/features/posts/group-post-action";

export type PrivacyType = "public" | "friends" | "custom";

export interface StoryReaction {
  user: string;
  type: ReactionType;
  _id: string;
}

export interface StoryMedia {
  url: string;
  public_id: string;
  type: "image" | "video";
  thumbnail: string;
}

export interface StoryUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: {
    public_id: string;
    url: string;
  };
}

export interface Story {
  _id: string;
  user: StoryUser;
  media: StoryMedia[];
  viewers: string[];
  privacy: PrivacyType;
  customAudience: string[];
  text: string;
  backgroundColor: string;
  replyCount: number;
  expiresAt: string;
  reactions: StoryReaction[]; // ← was string[], must be StoryReaction[]
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface StoryGroup {
  user: StoryUser;
  stories: Story[];
}
