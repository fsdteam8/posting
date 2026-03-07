export const baseURL = process.env.NEXT_PUBLIC_API_URL!;

export const DEFAULT_IMAGES = {
  group: {
    cover: "/features/group/groups-default-cover-photo-2x-compressed.png",
  },
  user: {
    avatar: "/features/user/default-avatar.webp",
  },
} as const;
