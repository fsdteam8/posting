"use client";

import type { MessengerUser } from "@/types/messenger";
import {
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  UserPlus,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getUserAvatar, userFullName } from "./helpers";

interface Props {
  open: boolean;
  user: MessengerUser | null;
  selfUser: MessengerUser;
  kind: "audio" | "video";
  onClose: () => void;
}

export function CallScreen({
  open,
  user,
  selfUser,
  kind,
  onClose,
}: Props) {
  const [muted, setMuted] = useState(false);
  const [video, setVideo] = useState(kind === "video");
  const [speaker, setSpeaker] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!open || !user) return null;

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const fullName = userFullName(user);
  const bg = getUserAvatar(user);

  return (
    <div className="absolute inset-0 z-30 overflow-hidden">
      <Image
        src={bg}
        alt={fullName}
        fill
        sizes="100vw"
        className="object-cover blur-xl"
        priority
      />
      <div className="absolute inset-0 bg-black/20" />

      <div className="absolute left-1/2 top-6 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/35 px-4 py-2 text-white backdrop-blur">
        <CallTopBtn
          icon={speaker ? Volume2 : VolumeX}
          label="Phone"
          onClick={() => setSpeaker((v) => !v)}
        />
        <CallTopBtn
          icon={muted ? MicOff : Mic}
          label="Mute"
          onClick={() => setMuted((v) => !v)}
        />
        <CallTopBtn icon={Share2} label="Share" />
        <CallTopBtn
          icon={video ? Video : VideoOff}
          label="Video"
          onClick={() => setVideo((v) => !v)}
        />
        <button
          type="button"
          onClick={onClose}
          className="flex cursor-pointer flex-col items-center px-2 text-white"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-rose-500">
            <PhoneOff className="size-4" />
          </span>
          <span className="mt-1 text-[10px]">End</span>
        </button>
      </div>

      <button
        type="button"
        className="absolute right-6 top-6 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/70 text-primary backdrop-blur hover:bg-white"
        aria-label="Add participant"
      >
        <UserPlus className="size-4" />
      </button>

      <div className="pointer-events-none relative z-0 flex h-full w-full flex-col items-center justify-center text-white">
        <div className="relative size-20 overflow-hidden rounded-full ring-4 ring-white/50">
          <Image
            src={bg}
            alt={fullName}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <p className="mt-3 text-2xl font-semibold">{fullName}</p>
        <p className="text-[14px] opacity-90">
          {mm}:{ss} min
        </p>

        <button
          type="button"
          className="pointer-events-auto mt-4 flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90"
        >
          <MessageCircle className="size-3.5" />
          Message
        </button>
      </div>

      <div className="absolute bottom-6 right-6 z-10 h-44 w-32 overflow-hidden rounded-2xl border-2 border-white/40 bg-black">
        <Image
          src={getUserAvatar(selfUser)}
          alt={userFullName(selfUser)}
          fill
          sizes="128px"
          className="object-cover"
        />
        <span className="absolute bottom-1 left-2 text-[11px] font-medium text-white">
          {userFullName(selfUser)}
        </span>
      </div>
    </div>
  );
}

function CallTopBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Mic;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center text-white"
    >
      <Icon className="size-4" />
      <span className="mt-0.5 text-[10px]">{label}</span>
    </button>
  );
}
