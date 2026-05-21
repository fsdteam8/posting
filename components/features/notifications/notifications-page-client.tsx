"use client";

import { useDeleteNotification } from "@/hooks/features/notifications/api/use-delete-notification";
import { useGetNotifications } from "@/hooks/features/notifications/api/use-get-notifications";
import { useMarkAllRead } from "@/hooks/features/notifications/api/use-mark-all-read";
import { useMarkNotificationRead } from "@/hooks/features/notifications/api/use-mark-notification-read";
import { normalizeDeepLink } from "@/lib/notification-deeplink";
import { Notification } from "@/types/notification/notification";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChevronLeft,
  Loader2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Tab = "all" | "unread" | "read";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

const LIMIT = 20;

interface Props {
  accessToken: string;
}

export function NotificationsPageClient({ accessToken }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);

  const unreadParam =
    activeTab === "unread" ? true : activeTab === "read" ? false : undefined;

  const { data, isLoading, isFetching } = useGetNotifications({
    accessToken,
    page,
    limit: LIMIT,
    unread: unreadParam,
  });

  const { mutate: markRead } = useMarkNotificationRead({
    accessToken,
  });
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead({
    accessToken,
  });
  const { mutate: deleteNotif } = useDeleteNotification({ accessToken });

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;
  const unreadCount = data?.meta?.unreadCount ?? 0;

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setPage(1);
  }

  function handleNotifClick(notif: Notification) {
    if (!notif.read) markRead({ notificationId: notif._id });
    router.push(normalizeDeepLink(notif.deepLink));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-semibold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCheck className="w-3 h-3" />
              )}
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-lg transition-all duration-150 ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {isLoading || isFetching ? (
            <NotificationSkeleton />
          ) : notifications.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="divide-y divide-border/60">
              {notifications.map((notif) => (
                <NotificationRow
                  key={notif._id}
                  notification={notif}
                  onClick={() => handleNotifClick(notif)}
                  onMarkRead={() => markRead({ notificationId: notif._id })}
                  onDelete={() => deleteNotif({ notificationId: notif._id })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-[11px] text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Notification Row
function NotificationRow({
  notification,
  onClick,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onClick: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const avatarUrl =
    notification.actor?.profileImage?.url ||
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${notification.actor?._id}&backgroundColor=b6e3f4`;

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-muted/40 ${
        !notification.read ? "bg-primary/3" : ""
      }`}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      )}

      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <Image
          src={avatarUrl}
          alt={notification.actor?.firstName ?? "User"}
          width={40}
          height={40}
          className="rounded-full object-cover w-10 h-10"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-16 sm:pr-20">
        <p className="text-xs font-semibold text-foreground leading-snug">
          {notification.title}
        </p>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
          {notification.body}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Actions */}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.read && (
          <button
            onClick={onMarkRead}
            title="Mark as read"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onDelete}
          title="Delete"
          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ tab }: { tab: Tab }) {
  const config = {
    all: {
      icon: Bell,
      title: "No notifications yet",
      desc: "When someone interacts with you, it will show up here.",
    },
    unread: {
      icon: CheckCheck,
      title: "You're all caught up",
      desc: "No unread notifications right now.",
    },
    read: {
      icon: BellOff,
      title: "No read notifications",
      desc: "Notifications you've read will appear here.",
    },
  };

  const { icon: Icon, title, desc } = config[tab];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{desc}</p>
    </div>
  );
}

// Skeleton Loader
function NotificationSkeleton() {
  return (
    <div className="divide-y divide-border/60">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 px-4 py-3.5 animate-pulse"
        >
          <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-2.5 bg-muted rounded w-2/5" />
            <div className="h-2 bg-muted rounded w-3/5" />
            <div className="h-2 bg-muted rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
