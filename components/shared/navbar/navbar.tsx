"use client";

import FeedPostModalContainer from "@/components/shared/features/post-modal/feed-post-modal-container";
import { useGetFriendRequests } from "@/hooks/features/friends/use-get-friend-requests";
import { useGetConversations } from "@/hooks/features/messenger/api/use-get-conversations";
import { useMessengerSocket } from "@/hooks/features/messenger/use-messenger-socket";
import { useGetNotifications } from "@/hooks/features/notifications/api/use-get-notifications";
import { useNotificationSocket } from "@/hooks/features/notifications/use-notification-socket";
import { useGetMyPages } from "@/hooks/features/pages/use-get-my-pages";
import { useProfile } from "@/hooks/profile/use-profile";
import { Bell, MessageCircle, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CreateMenu } from "./create-menu";
import { FriendRequestsPanel } from "./friend-requests-panel";
import { IconButton } from "./icon-button";
import { MessengerPanel } from "./messenger-panel";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { NavSearch } from "./nav-search";
import { NotificationPanel } from "./notification-panel";
import { ProfileMenu } from "./profile-menu";

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
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const { data: notifData } = useGetNotifications({ accessToken, limit: 1 });
  const unreadCount = notifData?.meta?.unreadCount ?? 0;
  const { data: friendRequestsData } = useGetFriendRequests({
    accessToken,
    mode: "incoming",
  });
  const friendRequestsCount = friendRequestsData?.data?.length ?? 0;

  const { data: profile } = useProfile(accessToken);

  const { data: myPagesData } = useGetMyPages({ accessToken });
  const pages = useMemo(
    () =>
      (myPagesData?.data ?? []).map((p) => ({
        id: p._id,
        name: p.name,
        avatarUrl:
          p.profileImage?.url ||
          `https://api.dicebear.com/9.x/icons/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=c0aede`,
      })),
    [myPagesData],
  );

  // Live conversations list — feeds the unread badge AND drives the panel preview
  const { data: convData } = useGetConversations({ accessToken, limit: 50 });
  const conversations = useMemo(() => convData?.data ?? [], [convData]);
  const messengerUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations],
  );

  // Keep the cached conversations live so the badge updates on incoming messages
  useMessengerSocket({ userId: profile?._id });

  // Live notifications (also covers friend_request / friend_accept since both go through notification:new)
  useNotificationSocket({ userId: profile?._id });

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
      <div className="flex shrink-0 items-center gap-2 px-2 sm:px-4">
        <Link
          href="/"
          aria-label="Postin Home"
          className="hidden sm:flex items-center gap-1 text-[#1DA1F2] font-semibold text-xl"
        >
          Postin
        </Link>
        <NavSearch onSearch={handleSearch} accessToken={accessToken} />
      </div>

      {/* Center Section - Nav Icons */}
      <NavLinks />

      {/* Right Section */}
      <div className="flex shrink-0 items-center gap-1 px-2 sm:gap-2 sm:px-4">
        <div className="hidden sm:flex items-center gap-2">
          <CreateMenu onPostClick={() => setPostModalOpen(true)} />

          <div className="relative">
            <IconButton
              icon={MessageCircle}
              label="Messenger"
              badge={messengerUnread}
              onClick={() => {
                setShowMessenger((v) => !v);
                setShowFriendRequests(false);
                setShowNotifications(false);
              }}
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
              icon={UserRoundPlus}
              label="Friend Requests"
              badge={friendRequestsCount}
              onClick={() => {
                setShowFriendRequests((v) => !v);
                setShowMessenger(false);
                setShowNotifications(false);
              }}
            />
            {showFriendRequests && (
              <FriendRequestsPanel
                accessToken={accessToken}
                onClose={() => setShowFriendRequests(false)}
              />
            )}
          </div>

          <div className="relative">
            <IconButton
              icon={Bell}
              label="Notifications"
              badge={unreadCount}
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowMessenger(false);
                setShowFriendRequests(false);
              }}
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
          <MobileMenu
            messengerUnread={messengerUnread}
            friendRequestsCount={friendRequestsCount}
            notificationUnread={unreadCount}
            onPostClick={() => setPostModalOpen(true)}
          />
        </div>
        <ProfileMenu
          user={USER}
          pages={pages}
          activeIdentity={activeIdentity}
          onSwitchIdentity={setActiveIdentity}
        />
      </div>

      {/* Headless create-post modal, controlled by the create menus */}
      <FeedPostModalContainer
        accessToken={accessToken}
        externalOpen={postModalOpen}
        onExternalOpenChange={setPostModalOpen}
      />
    </header>
  );
}
