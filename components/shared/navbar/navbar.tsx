"use client";

import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import { useMessengerSocket } from "@/hooks/features/messenger/use-messenger-socket";
import { useGetNotifications } from "@/hooks/features/notifications/api/use-get-notifications";
import { useProfile } from "@/hooks/profile/use-profile";
import { Bell, Menu, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { IconButton } from "./icon-button";
import { MessengerPanel } from "./messenger-panel";
import { NavLinks } from "./nav-links";
import { NavSearch } from "./nav-search";
import { NotificationPanel } from "./notification-panel";
import { ProfileMenu } from "./profile-menu";

const PAGES = [
  {
    id: "tourhub",
    name: "TourHub",
    avatarUrl:
      "https://api.dicebear.com/9.x/icons/svg?seed=TourHub&backgroundColor=c0aede",
  },
  {
    id: "breakup-support",
    name: "Breakup Support",
    avatarUrl:
      "https://api.dicebear.com/9.x/icons/svg?seed=Breakup&backgroundColor=ffdfbf",
  },
];

interface Props {
  accessToken: string;
}

export default function Navbar({ accessToken }: Props) {
  const [activeIdentity, setActiveIdentity] = useState<{
    type: "user" | "page";
    id?: string;
  }>({
    type: "page",
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);

  const { data: notifData } = useGetNotifications({ accessToken, limit: 1 });
  const unreadCount = notifData?.meta?.unreadCount ?? 0;

  const { data: profile } = useProfile(accessToken);

  // Live conversations list — feeds the unread badge AND drives the panel preview
  const { data: convData } = useGetConversations({ accessToken, limit: 50 });
  const conversations = useMemo(() => convData?.data ?? [], [convData]);
  const messengerUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations],
  );

  // Keep the cached conversations live so the badge updates on incoming messages
  useMessengerSocket({ userId: profile?._id });

  const USER = {
    name: profile ? `${profile.firstName} ${profile.lastName}` : "...",
    avatarUrl:
      profile?.profileImage?.url ||
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.firstName}&backgroundColor=b6e3f4`,
  };

  function handleSearch(query: string) {
    console.log("Search query:", query);
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center border-b bg-card shadow-sm">
      {/* Left Section */}
      <div className="flex shrink-0 items-center gap-2 px-4">
        <Link
          href="/"
          aria-label="Postin Home"
          className="flex items-center gap-1 text-[#1DA1F2] font-semibold text-xl"
        >
          Postin
        </Link>
        <NavSearch onSearch={handleSearch} />
      </div>

      {/* Center Section - Nav Icons */}
      <NavLinks />

      {/* Right Section */}
      <div className="flex shrink-0 items-center gap-2 px-4">
        <div className="hidden sm:flex items-center gap-2">
          <IconButton icon={Plus} label="Create" />

          <div className="relative">
            <IconButton
              icon={MessageCircle}
              label="Messenger"
              badge={messengerUnread}
              onClick={() => setShowMessenger((v) => !v)}
            />
            {showMessenger && (
              <MessengerPanel
                accessToken={accessToken}
                onClose={() => setShowMessenger(false)}
              />
            )}
          </div>

          <div className="relative">
            <IconButton
              icon={Bell}
              label="Notifications"
              badge={unreadCount}
              onClick={() => setShowNotifications((prev) => !prev)}
            />
            {showNotifications && (
              <NotificationPanel
                accessToken={accessToken}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        </div>
        <div className="flex sm:hidden">
          <IconButton icon={Menu} label="Menu" />
        </div>
        <ProfileMenu
          user={USER}
          pages={PAGES}
          activeIdentity={activeIdentity}
          onSwitchIdentity={setActiveIdentity}
        />
      </div>
    </header>
  );
}
