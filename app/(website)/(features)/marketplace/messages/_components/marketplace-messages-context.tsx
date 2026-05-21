"use client";

/**
 * Minimal MessengerProvider value for the marketplace messages inbox.
 *
 * The marketplace chat surface reuses ChatArea / ChatHeader / ConversationItem
 * from the social messenger so it benefits from the same message-bubble UI and
 * real-time wiring. Those components read `useMessenger()` for things like
 * presence and per-conversation theme/nickname overrides — features the
 * marketplace inbox deliberately doesn't carry. This provider supplies a
 * minimal no-op shape so the shared components mount without errors but
 * none of the social-only chrome is offered to the user.
 */

import { MessengerProvider } from "@/app/(website)/messenger/_components/messenger-context";
import type { MessengerUser } from "@/types/messenger";
import type { ReactNode } from "react";

interface Props {
  accessToken: string;
  me: MessengerUser;
  children: ReactNode;
}

export function MarketplaceMessagesProvider({
  accessToken,
  me,
  children,
}: Props) {
  return (
    <MessengerProvider
      value={{
        accessToken,
        me,
        pinnedIds: new Set(),
        togglePin: () => {},
        mutedIds: new Set(),
        toggleMuteConv: () => {},
        themes: {},
        setThemeFor: () => {},
        nicknames: {},
        setNicknamesFor: () => {},
        openNewGroup: () => {},
        openTheme: () => {},
        openNicknames: () => {},
        openReport: () => {},
        openCall: () => {},
        requestBlock: () => {},
        requestDeleteChat: () => {},
        presence: {},
      }}
    >
      {children}
    </MessengerProvider>
  );
}
