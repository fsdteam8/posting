"use client";

import { createContext, useContext } from "react";
import type { MessengerUser } from "@/types/messenger";
import type { PresenceState } from "@/hooks/features/presence/use-presence-socket";

interface MessengerContextValue {
  accessToken: string;
  me: MessengerUser;
  pinnedIds: Set<string>;
  togglePin: (id: string) => void;
  mutedIds: Set<string>;
  toggleMuteConv: (id: string) => void;
  themes: Record<string, string>;
  setThemeFor: (conversationId: string, themeId: string) => void;
  nicknames: Record<string, Record<string, string>>;
  setNicknamesFor: (
    conversationId: string,
    map: Record<string, string>,
  ) => void;
  openNewGroup: (prefill?: MessengerUser[]) => void;
  openTheme: () => void;
  openNicknames: () => void;
  openReport: (subject: string) => void;
  openCall: (kind: "audio" | "video", user: MessengerUser) => void;
  requestBlock: (user: MessengerUser, conversationId: string) => void;
  requestDeleteChat: (conversationId: string) => void;
  /** Live presence map keyed by userId. May be empty until users come online. */
  presence: Record<string, PresenceState>;
}

const Ctx = createContext<MessengerContextValue | null>(null);

export const MessengerProvider = Ctx.Provider;

export function useMessenger() {
  const v = useContext(Ctx);
  if (!v)
    throw new Error("useMessenger must be used within MessengerProvider");
  return v;
}
