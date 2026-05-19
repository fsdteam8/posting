import type { Conversation, MessengerUser } from "@/types/messenger";

const DEFAULT_AVATAR = "/features/user/default-avatar.webp";
const DEFAULT_GROUP_AVATAR = "/features/group/groups-default-cover-photo-2x-compressed.png";

export function getConversationTitle(c: Conversation, meId: string): string {
  if (c.isGroup) return c.name || "Group chat";
  const other = c.participants.find((p) => p._id !== meId) || c.participants[0];
  return other ? `${other.firstName} ${other.lastName}` : "Conversation";
}

export function getConversationAvatar(c: Conversation, meId: string): string {
  if (c.isGroup) return c.avatar?.url || DEFAULT_GROUP_AVATAR;
  const other = c.participants.find((p) => p._id !== meId) || c.participants[0];
  return other?.profileImage?.url || DEFAULT_AVATAR;
}

export function getOtherParticipant(
  c: Conversation,
  meId: string,
): MessengerUser | null {
  if (c.isGroup) return null;
  return c.participants.find((p) => p._id !== meId) || c.participants[0] || null;
}

export function getUserAvatar(user?: MessengerUser | null): string {
  return user?.profileImage?.url || DEFAULT_AVATAR;
}

export function userFullName(u?: MessengerUser | null): string {
  if (!u) return "";
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
}

// ─── localStorage-backed per-conversation prefs ─────────────────────────────

const PIN_KEY = "messenger:pinned";
const MUTE_KEY = "messenger:muted";
const THEME_KEY = "messenger:themes";
const NICK_KEY = "messenger:nicknames";

const EVENTS = {
  pinned: "messenger:pinned-changed",
  muted: "messenger:muted-changed",
  themes: "messenger:themes-changed",
  nicknames: "messenger:nicknames-changed",
} as const;

type EventKey = keyof typeof EVENTS;

function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setJSON(key: string, value: unknown, ev: EventKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENTS[ev]));
}

function makeSubscriber(ev: EventKey) {
  return (cb: () => void): (() => void) => {
    if (typeof window === "undefined") return () => {};
    const handler = () => cb();
    window.addEventListener(EVENTS[ev], handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENTS[ev], handler);
      window.removeEventListener("storage", handler);
    };
  };
}

// ── Pinned conversations (existing) ─────────────────────────────────────────
const EMPTY_PINNED: Set<string> = new Set();
let pinnedSnapshot: Set<string> = new Set(getJSON<string[]>(PIN_KEY, []));
let pinnedRaw: string | null =
  typeof window !== "undefined"
    ? window.localStorage.getItem(PIN_KEY)
    : null;

export function getPinnedSnapshot(): Set<string> {
  if (typeof window === "undefined") return EMPTY_PINNED;
  const current = window.localStorage.getItem(PIN_KEY);
  if (current !== pinnedRaw) {
    pinnedRaw = current;
    pinnedSnapshot = new Set(getJSON<string[]>(PIN_KEY, []));
  }
  return pinnedSnapshot;
}
export function getServerPinnedSnapshot(): Set<string> {
  return EMPTY_PINNED;
}
export const subscribePinned = makeSubscriber("pinned");
export function writePinned(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(Array.from(ids));
  window.localStorage.setItem(PIN_KEY, raw);
  pinnedRaw = raw;
  pinnedSnapshot = new Set(ids);
  window.dispatchEvent(new Event(EVENTS.pinned));
}

// ── Mute (per conversation) ─────────────────────────────────────────────────
const EMPTY_MUTED: Set<string> = new Set();
let mutedSnapshot: Set<string> = new Set(getJSON<string[]>(MUTE_KEY, []));
let mutedRaw: string | null =
  typeof window !== "undefined"
    ? window.localStorage.getItem(MUTE_KEY)
    : null;

export function getMutedSnapshot(): Set<string> {
  if (typeof window === "undefined") return EMPTY_MUTED;
  const current = window.localStorage.getItem(MUTE_KEY);
  if (current !== mutedRaw) {
    mutedRaw = current;
    mutedSnapshot = new Set(getJSON<string[]>(MUTE_KEY, []));
  }
  return mutedSnapshot;
}
export function getServerMutedSnapshot(): Set<string> {
  return EMPTY_MUTED;
}
export const subscribeMuted = makeSubscriber("muted");
export function isMuted(conversationId: string): boolean {
  return getMutedSnapshot().has(conversationId);
}
export function toggleMute(conversationId: string): void {
  const next = new Set(getMutedSnapshot());
  if (next.has(conversationId)) next.delete(conversationId);
  else next.add(conversationId);
  const raw = JSON.stringify(Array.from(next));
  window.localStorage.setItem(MUTE_KEY, raw);
  mutedRaw = raw;
  mutedSnapshot = next;
  window.dispatchEvent(new Event(EVENTS.muted));
}

// ── Theme per conversation ──────────────────────────────────────────────────
const EMPTY_THEMES: Record<string, string> = Object.freeze({});
let themesSnapshot: Record<string, string> = getJSON<Record<string, string>>(
  THEME_KEY,
  {},
);
let themesRaw: string | null =
  typeof window !== "undefined"
    ? window.localStorage.getItem(THEME_KEY)
    : null;

export function getThemesSnapshot(): Record<string, string> {
  if (typeof window === "undefined") return EMPTY_THEMES;
  const current = window.localStorage.getItem(THEME_KEY);
  if (current !== themesRaw) {
    themesRaw = current;
    themesSnapshot = getJSON<Record<string, string>>(THEME_KEY, {});
  }
  return themesSnapshot;
}
export function getServerThemesSnapshot(): Record<string, string> {
  return EMPTY_THEMES;
}
export const subscribeThemes = makeSubscriber("themes");
export function getTheme(conversationId: string | null): string | undefined {
  if (!conversationId) return undefined;
  return getThemesSnapshot()[conversationId];
}
export function setTheme(conversationId: string, themeId: string): void {
  const next = { ...getThemesSnapshot(), [conversationId]: themeId };
  setJSON(THEME_KEY, next, "themes");
  themesRaw = JSON.stringify(next);
  themesSnapshot = next;
}

// ── Nicknames per (conversation, user) ──────────────────────────────────────
type NicknameMap = Record<string, Record<string, string>>;
const EMPTY_NICKS: NicknameMap = Object.freeze({});
let nicksSnapshot: NicknameMap = getJSON<NicknameMap>(NICK_KEY, {});
let nicksRaw: string | null =
  typeof window !== "undefined"
    ? window.localStorage.getItem(NICK_KEY)
    : null;

export function getNicknamesSnapshot(): NicknameMap {
  if (typeof window === "undefined") return EMPTY_NICKS;
  const current = window.localStorage.getItem(NICK_KEY);
  if (current !== nicksRaw) {
    nicksRaw = current;
    nicksSnapshot = getJSON<NicknameMap>(NICK_KEY, {});
  }
  return nicksSnapshot;
}
export function getServerNicknamesSnapshot(): NicknameMap {
  return EMPTY_NICKS;
}
export const subscribeNicknames = makeSubscriber("nicknames");
export function getNickname(
  conversationId: string | null,
  userId: string,
): string | undefined {
  if (!conversationId) return undefined;
  return getNicknamesSnapshot()[conversationId]?.[userId];
}
export function setNicknamesForConversation(
  conversationId: string,
  map: Record<string, string>,
): void {
  const next = { ...getNicknamesSnapshot(), [conversationId]: map };
  setJSON(NICK_KEY, next, "nicknames");
  nicksRaw = JSON.stringify(next);
  nicksSnapshot = next;
}

// ── Title helper that respects nicknames ────────────────────────────────────
export function displayNameInConversation(
  user: MessengerUser,
  conversationId: string | null,
): string {
  const nick = getNickname(conversationId, user._id);
  return nick || userFullName(user);
}
