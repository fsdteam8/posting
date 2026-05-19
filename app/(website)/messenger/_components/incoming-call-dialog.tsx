"use client";

import type { CallParticipantInfo } from "@/hooks/features/messenger/use-call";
import { Phone, PhoneOff, Video } from "lucide-react";
import Image from "next/image";
import { DEFAULT_IMAGES } from "@/constants";

interface Props {
  open: boolean;
  caller: CallParticipantInfo | null;
  kind: "audio" | "video";
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallDialog({
  open,
  caller,
  kind,
  onAccept,
  onReject,
}: Props) {
  if (!open || !caller) return null;

  const avatar =
    caller.profileImage?.url || DEFAULT_IMAGES.user.avatar;
  const fullName = `${caller.firstName} ${caller.lastName}`.trim();

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-card p-8 text-center shadow-2xl">
        <div className="relative size-24 overflow-hidden rounded-full ring-4 ring-primary/30">
          <Image
            src={avatar}
            alt={fullName}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <p className="mt-4 text-lg font-semibold">{fullName}</p>
        <p className="text-sm text-muted-foreground">
          Incoming {kind === "video" ? "video" : "audio"} call...
        </p>

        <div className="mt-6 flex items-center gap-8">
          <button
            type="button"
            onClick={onReject}
            aria-label="Reject"
            className="flex flex-col items-center gap-2 text-destructive"
          >
            <span className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-destructive text-white shadow-md transition hover:scale-105">
              <PhoneOff className="size-6" />
            </span>
            <span className="text-[11px] font-medium">Decline</span>
          </button>
          <button
            type="button"
            onClick={onAccept}
            aria-label="Accept"
            className="flex flex-col items-center gap-2 text-emerald-600"
          >
            <span className="flex size-14 animate-pulse cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition hover:scale-105">
              {kind === "video" ? (
                <Video className="size-6" />
              ) : (
                <Phone className="size-6" />
              )}
            </span>
            <span className="text-[11px] font-medium">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}
