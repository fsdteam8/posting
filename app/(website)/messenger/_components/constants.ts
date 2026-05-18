export const THEMES = [
  { id: "default", name: "Default", color: "from-white to-white" },
  { id: "obesity-1", name: "Obesity", color: "from-emerald-200 to-teal-200" },
  { id: "obesity-2", name: "Obesity", color: "from-amber-200 to-orange-200" },
  { id: "vr-1", name: "Virtual Reality", color: "from-fuchsia-200 to-pink-200" },
  { id: "smart-grid", name: "Smart Grid", color: "from-yellow-200 to-amber-300" },
  { id: "wind-power", name: "Wind Power", color: "from-cyan-200 to-sky-200" },
  { id: "smart-building", name: "Smart Building", color: "from-stone-200 to-zinc-300" },
  { id: "vr-2", name: "Virtual Reality", color: "from-violet-200 to-purple-200" },
  { id: "social-media", name: "Social Media", color: "from-rose-200 to-red-200" },
  { id: "blog-themes", name: "Blog Themes", color: "from-blue-200 to-indigo-200" },
  { id: "blockchain", name: "Blockchain", color: "from-orange-200 to-red-300" },
  { id: "biotech", name: "Biotech", color: "from-lime-200 to-green-200" },
  { id: "blockchain-2", name: "Blockchain", color: "from-pink-200 to-rose-300" },
  { id: "robotics", name: "Robotics & AI", color: "from-red-200 to-rose-300" },
  { id: "solar-power", name: "Solar Power", color: "from-yellow-200 to-orange-300" },
  { id: "healthcare", name: "Healthcare", color: "from-emerald-100 to-emerald-300" },
];

export function getThemeById(themeId?: string | null) {
  if (!themeId) return null;
  return THEMES.find((t) => t.id === themeId) || null;
}

// Same reaction set used by the newsfeed (see components/shared/features/posts/group-post-action.tsx)
export const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like", color: "#1877f2" },
  { type: "love", emoji: "❤️", label: "Love", color: "#f33e58" },
  { type: "haha", emoji: "😆", label: "Haha", color: "#f7b928" },
  { type: "wow", emoji: "😮", label: "Wow", color: "#f7b928" },
  { type: "sad", emoji: "😢", label: "Sad", color: "#f7b928" },
  { type: "angry", emoji: "😡", label: "Angry", color: "#e9710f" },
  { type: "care", emoji: "🥰", label: "Care", color: "#f7b928" },
] as const;

export type MessengerReactionType = (typeof REACTIONS)[number]["type"];

// Backward-compat exports (chat picks 5 quick reactions; "more" opens emoji picker)
export const QUICK_REACTIONS = REACTIONS.slice(0, 5);

// Map a stored emoji value back to a known reaction (so legacy unicode reactions still render)
export function resolveReaction(value: string) {
  const byEmoji = REACTIONS.find((r) => r.emoji === value);
  if (byEmoji) return byEmoji;
  const byType = REACTIONS.find((r) => r.type === value.toLowerCase());
  if (byType) return byType;
  return { type: value, emoji: value, label: value, color: "#888" };
}
