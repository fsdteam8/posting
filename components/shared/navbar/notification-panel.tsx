"use client";

import { useDeleteNotification } from "@/hooks/features/notifications/api/use-delete-notification";
import { useGetNotifications } from "@/hooks/features/notifications/api/use-get-notifications";
import { useMarkAllRead } from "@/hooks/features/notifications/api/use-mark-all-read";
import { useMarkNotificationRead } from "@/hooks/features/notifications/api/use-mark-notification-read";
import { Notification } from "@/types/notification/notification";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, Loader2, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface Props {
  accessToken: string;
  onClose: () => void;
}

export function NotificationPanel({ accessToken, onClose }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useGetNotifications({ accessToken, limit: 20 });
  const { mutate: markRead } = useMarkNotificationRead({ accessToken });
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead({
    accessToken,
  });
  const { mutate: deleteNotif } = useDeleteNotification({ accessToken });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  function handleNotificationClick(notif: Notification) {
    if (!notif.read) {
      markRead({ notificationId: notif._id });
    }
    router.push(notif.deepLink);
    onClose();
  }

  const unreadCount = data?.meta?.unreadCount ?? 0;
  const notifications = data?.data ?? [];

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-90 rounded-xl border bg-card shadow-xl ring-1 ring-black/5 overflow-hidden z-50
        animate-in fade-in-0 slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              disabled={markingAll}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
            >
              {markingAll ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCheck className="w-3 h-3" />
              )}
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-105 overflow-y-auto divide-y divide-border/50">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif._id}
              notification={notif}
              onClick={() => handleNotificationClick(notif)}
              onMarkRead={() => markRead({ notificationId: notif._id })}
              onDelete={() => deleteNotif({ notificationId: notif._id })}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t px-4 py-2.5">
          <button
            onClick={() => {
              router.push("/notifications");
              onClose();
            }}
            className="w-full text-center text-xs text-primary hover:underline"
          >
            See all notifications
          </button>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
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
      className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${
        !notification.read ? "bg-primary/3" : ""
      }`}
      onClick={onClick}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      {/* Avatar */}
      <div className="relative shrink-0 mt-0.5">
        <Image
          src={avatarUrl}
          alt={notification.actor?.firstName ?? "User"}
          width={36}
          height={36}
          className="rounded-full object-cover w-9 h-9"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground leading-snug line-clamp-1">
          {notification.title}
        </p>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
          {notification.body}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Actions — show on hover */}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.read && (
          <button
            onClick={onMarkRead}
            title="Mark as read"
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onDelete}
          title="Delete"
          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
