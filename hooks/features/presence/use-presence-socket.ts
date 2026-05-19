"use client";

import { getAppSocket } from "@/hooks/features/messenger/socket-singleton";
import { useEffect, useMemo, useState } from "react";

interface PresencePayload {
  userId: string;
  isOnline: boolean;
  lastActiveAt: string;
}

export interface PresenceState {
  isOnline: boolean;
  lastActiveAt: string;
}

interface Params {
  /** The signed-in user (used to attach to the socket). */
  viewerId: string | null | undefined;
  /** Users whose presence should be watched. Deduped internally. */
  watchUserIds: Array<string | null | undefined>;
}

/**
 * Subscribes to `userPresence` events for the given list of userIds. Returns
 * a map of `userId -> { isOnline, lastActiveAt }` that updates in real time as
 * users connect / disconnect.
 *
 * Consumers should merge this with any stored `isOnline` field so the live
 * value wins when present.
 */
export function usePresenceSocket({
  viewerId,
  watchUserIds,
}: Params): Record<string, PresenceState> {
  const [presence, setPresence] = useState<Record<string, PresenceState>>({});

  // Stable, deduped list — joined into a single string so the effect doesn't
  // re-run on every parent render that builds a new array reference.
  const watchKey = useMemo(() => {
    const set = new Set<string>();
    for (const id of watchUserIds) {
      if (typeof id === "string" && id.length > 0) set.add(id);
    }
    return Array.from(set).sort().join(",");
  }, [watchUserIds]);

  useEffect(() => {
    if (!viewerId || !watchKey) return;
    const ids = watchKey.split(",").filter(Boolean);
    if (ids.length === 0) return;

    const socket = getAppSocket(viewerId);

    function startWatching() {
      for (const id of ids) socket.emit("watchPresence", id);
    }

    function onPresence(payload: PresencePayload) {
      if (!ids.includes(payload.userId)) return;
      setPresence((prev) => ({
        ...prev,
        [payload.userId]: {
          isOnline: payload.isOnline,
          lastActiveAt: payload.lastActiveAt,
        },
      }));
    }

    if (socket.connected) {
      startWatching();
    } else {
      socket.once("connect", startWatching);
    }

    socket.on("userPresence", onPresence);

    return () => {
      socket.off("userPresence", onPresence);
      socket.off("connect", startWatching);
      for (const id of ids) socket.emit("unwatchPresence", id);
    };
  }, [viewerId, watchKey]);

  return presence;
}
