export interface Story {
  id: string;
  name: string;
  avatarUrl: string;
  imageUrl: string;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  timestamp: string;
  privacy: "public" | "friends" | "only-me";
  text: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface SponsoredAd {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkText: string;
}

export interface FriendRequest {
  id: string;
  name: string;
  avatarUrl: string;
  mutualFriends: number;
}

export interface Contact {
  id: string;
  name: string;
  avatarUrl: string;
  online: boolean;
}

export const currentUser = {
  name: "Martina Luke",
  avatarUrl:
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Martina&backgroundColor=b6e3f4",
};

export const stories: Story[] = [
  {
    id: "s1",
    name: "Tom Russo",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Tom&backgroundColor=ffd5dc",
    imageUrl: "/images/story-1.jpg",
  },
  {
    id: "s2",
    name: "Sara Chen",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Sara&backgroundColor=c0aede",
    imageUrl: "/images/story-2.jpg",
  },
  {
    id: "s3",
    name: "Tom Russo",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Tom&backgroundColor=ffd5dc",
    imageUrl: "/images/story-3.jpg",
  },
  {
    id: "s4",
    name: "Alex Kim",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex&backgroundColor=d1f4d1",
    imageUrl: "/images/story-4.jpg",
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    author: {
      name: "Tom Russo",
      avatarUrl:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Tom&backgroundColor=ffd5dc",
    },
    timestamp: "12 April at 09:25 PM",
    privacy: "public",
    text: "The best things in life are the people we love and the places we've been.",
    imageUrl: "/images/post-1.jpg",
    likes: 142,
    comments: 23,
    shares: 5,
  },
  {
    id: "p2",
    author: {
      name: "Sara Chen",
      avatarUrl:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Sara&backgroundColor=c0aede",
    },
    timestamp: "11 April at 03:10 PM",
    privacy: "friends",
    text: "Weekend vibes. Coffee, books, and good company.",
    imageUrl: "/images/post-2.jpg",
    likes: 87,
    comments: 12,
    shares: 2,
  },
  {
    id: "p3",
    author: {
      name: "Alex Kim",
      avatarUrl:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex&backgroundColor=d1f4d1",
    },
    timestamp: "10 April at 06:45 PM",
    privacy: "public",
    text: "Just launched my new portfolio website! Check it out and let me know what you think. Been working on this for the past few months and I'm really proud of how it turned out.",
    likes: 256,
    comments: 45,
    shares: 18,
  },
  {
    id: "p4",
    author: {
      name: "Jordan Lee",
      avatarUrl:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan&backgroundColor=ffdfbf",
    },
    timestamp: "9 April at 11:30 AM",
    privacy: "friends",
    text: "Amazing hike today at the national park. The views were absolutely breathtaking. Nature never disappoints!",
    likes: 198,
    comments: 32,
    shares: 8,
  },
  {
    id: "p5",
    author: {
      name: "Emily Davis",
      avatarUrl:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Emily&backgroundColor=b6e3f4",
    },
    timestamp: "8 April at 07:15 PM",
    privacy: "public",
    text: "Grateful for the little things today. Sometimes you just need to pause and appreciate what you have.",
    likes: 312,
    comments: 56,
    shares: 14,
  },
];

export const sponsoredAds: SponsoredAd[] = [
  {
    id: "ad1",
    title: "Gourmet Kitchen Co.",
    subtitle: "gourmetkitchen.com",
    imageUrl:
      "https://images.pexels.com/photos/7466999/pexels-photo-7466999.jpeg",
    linkText: "Shop Now",
  },
  {
    id: "ad2",
    title: "Modern Living Interiors",
    subtitle: "modernliving.com",
    imageUrl:
      "https://images.pexels.com/photos/2250136/pexels-photo-2250136.jpeg",
    linkText: "Learn More",
  },
];

export const friendRequests: FriendRequest[] = [
  {
    id: "fr1",
    name: "Chris Anderson",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Chris&backgroundColor=ffdfbf",
    mutualFriends: 8,
  },
];

export const contacts: Contact[] = [
  {
    id: "c1",
    name: "Karline Kroess",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Karline&backgroundColor=ffd5dc",
    online: true,
  },
  {
    id: "c2",
    name: "Tom Russo",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Tom&backgroundColor=ffd5dc",
    online: true,
  },
  {
    id: "c3",
    name: "Sara Chen",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Sara&backgroundColor=c0aede",
    online: false,
  },
  {
    id: "c4",
    name: "Alex Kim",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex&backgroundColor=d1f4d1",
    online: true,
  },
  {
    id: "c5",
    name: "Jordan Lee",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan&backgroundColor=ffdfbf",
    online: false,
  },
  {
    id: "c6",
    name: "Emily Davis",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Emily&backgroundColor=b6e3f4",
    online: true,
  },
  {
    id: "c7",
    name: "Liam O'Brien",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Liam&backgroundColor=d1f4d1",
    online: false,
  },
  {
    id: "c8",
    name: "Priya Patel",
    avatarUrl:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya&backgroundColor=c0aede",
    online: true,
  },
];
