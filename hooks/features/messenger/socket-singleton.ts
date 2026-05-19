"use client";

import { io, type Socket } from "socket.io-client";

let SOCKET: Socket | null = null;
let SOCKET_USER_ID: string | null = null;

function getSocketBase(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  return apiUrl.replace(/\/api\/v\d+\/?$/, "");
}

export function getAppSocket(userId: string): Socket {
  if (SOCKET && SOCKET_USER_ID === userId) return SOCKET;
  if (SOCKET) {
    SOCKET.disconnect();
    SOCKET = null;
  }
  SOCKET = io(getSocketBase(), {
    auth: { userId },
    transports: ["websocket", "polling"],
    reconnection: true,
  });
  SOCKET_USER_ID = userId;
  return SOCKET;
}

export function peekAppSocket(): Socket | null {
  return SOCKET;
}

// Backwards-compatible aliases (the singleton is now app-wide; renamed for clarity)
export const getMessengerSocket = getAppSocket;
export const peekMessengerSocket = peekAppSocket;
