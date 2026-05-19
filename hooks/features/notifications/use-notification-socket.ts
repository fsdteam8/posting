"use client";

import { getAppSocket } from "@/hooks/features/messenger/socket-singleton";
import type { NotificationsResponse } from "@/types/notification/notification";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface Params {
  userId: string | null | undefined;
}

/**
 * Subscribes to `notification:new` for the signed-in user. The backend auto-joins
 * `user_<userId>` on connect, so no explicit join is needed.
 *
 * The server emits the un-populated Notification document (actor is just an id),
 * so instead of patching the cache locally we invalidate the notifications
 * queries and let React Query refetch with a populated actor. We also bump the
 * unread counter optimistically so the bell badge updates instantly.
 */
export function useNotificationSocket({ userId }: Params) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const socket = getAppSocket(userId);

    function bumpUnreadOptimistically() {
      qc.setQueriesData<NotificationsResponse>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            meta: {
              ...old.meta,
              unreadCount: (old.meta?.unreadCount ?? 0) + 1,
            },
          };
        },
      );
    }

    function onNotificationNew() {
      bumpUnreadOptimistically();
      // Refetch to get populated actor data and the full new item.
      qc.invalidateQueries({ queryKey: ["notifications"] });
    }

    socket.on("notification:new", onNotificationNew);

    return () => {
      socket.off("notification:new", onNotificationNew);
    };
  }, [userId, qc]);
}
