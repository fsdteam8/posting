"use client";

import { DEFAULT_IMAGES } from "@/constants";
import type {
  CallParticipantInfo,
  CallState,
} from "@/hooks/features/messenger/use-call";
import { cn } from "@/lib/utils";
import type { MessengerUser } from "@/types/messenger";
import {
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  UserPlus,
  Video,
  VideoOff,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  state: CallState;
  selfUser: MessengerUser;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEnd: () => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
}

function fullNameOf(p: CallParticipantInfo | null): string {
  if (!p) return "";
  return `${p.firstName} ${p.lastName}`.trim();
}

function avatarOf(p: CallParticipantInfo | null | undefined): string {
  return p?.profileImage?.url || DEFAULT_IMAGES.user.avatar;
}

export function CallScreen({
  open,
  state,
  selfUser,
  localStream,
  remoteStream,
  onEnd,
  onToggleMic,
  onToggleCamera,
}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Bind streams to media elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Elapsed timer — only ticks while active. The component is given a `key`
  // by the parent (or by roomId here) so a new call mounts fresh at 0.
  useEffect(() => {
    if (state.status !== "active") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state.status]);

  if (!open) return null;

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const peerName = fullNameOf(state.peer);
  const peerAvatar = avatarOf(state.peer);
  const isVideo = state.kind === "video";
  const showRemoteVideo =
    isVideo && remoteStream && remoteStream.getVideoTracks().length > 0;

  let statusLabel = "";
  if (state.status === "outgoing") statusLabel = "Calling...";
  else if (state.status === "connecting") statusLabel = "Connecting...";
  else if (state.status === "active") statusLabel = `${mm}:${ss}`;

  return (
    <div className="fixed inset-0 z-110 overflow-hidden">
      {/* Background */}
      {showRemoteVideo ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <>
          <Image
            src={peerAvatar}
            alt={peerName}
            fill
            sizes="100vw"
            className="object-cover blur-xl"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}

      {/* Remote audio sink — invisible but plays */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />

      {/* Top action bar */}
      <div className="absolute left-1/2 top-6 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/45 px-4 py-2 text-white backdrop-blur">
        <CallTopBtn
          icon={state.micOn ? Mic : MicOff}
          label={state.micOn ? "Mute" : "Unmute"}
          onClick={onToggleMic}
          active={!state.micOn}
        />
        <CallTopBtn icon={Share2} label="Share" />
        {isVideo && (
          <CallTopBtn
            icon={state.cameraOn ? Video : VideoOff}
            label={state.cameraOn ? "Hide cam" : "Show cam"}
            onClick={onToggleCamera}
            active={!state.cameraOn}
          />
        )}
        <button
          type="button"
          onClick={onEnd}
          className="flex cursor-pointer flex-col items-center px-2 text-white"
          aria-label="End call"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-rose-500">
            <PhoneOff className="size-4" />
          </span>
          <span className="mt-1 text-[10px]">End</span>
        </button>
      </div>

      {/* Top-right add */}
      <button
        type="button"
        className="absolute right-6 top-6 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/70 text-primary backdrop-blur hover:bg-white"
        aria-label="Add participant"
      >
        <UserPlus className="size-4" />
      </button>

      {/* Center caller info (hidden if remote video active) */}
      {!showRemoteVideo && (
        <div className="pointer-events-none relative z-0 flex h-full w-full flex-col items-center justify-center text-white">
          <div className="relative size-20 overflow-hidden rounded-full ring-4 ring-white/50">
            <Image
              src={peerAvatar}
              alt={peerName}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <p className="mt-3 text-2xl font-semibold">{peerName || "Calling"}</p>
          <p className="flex items-center gap-2 text-[14px] opacity-90">
            {(state.status === "outgoing" ||
              state.status === "connecting") && (
              <Loader2 className="size-3.5 animate-spin" />
            )}
            {statusLabel}
          </p>

          <button
            type="button"
            className="pointer-events-auto mt-4 flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90"
          >
            <MessageCircle className="size-3.5" />
            Message
          </button>
        </div>
      )}

      {/* In-video status overlay when remote video is showing */}
      {showRemoteVideo && state.status !== "active" && (
        <div className="absolute inset-x-0 top-24 z-10 flex justify-center text-white">
          <span className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-[12px] backdrop-blur">
            <Loader2 className="size-3.5 animate-spin" />
            {statusLabel}
          </span>
        </div>
      )}

      {/* Self preview bottom-right */}
      <div className="absolute bottom-6 right-6 z-10 h-44 w-32 overflow-hidden rounded-2xl border-2 border-white/40 bg-black">
        {isVideo && state.cameraOn && localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="size-full object-cover"
          />
        ) : (
          <Image
            src={selfUser.profileImage?.url || DEFAULT_IMAGES.user.avatar}
            alt="self"
            fill
            sizes="128px"
            className="object-cover"
          />
        )}
        <span className="absolute bottom-1 left-2 text-[11px] font-medium text-white">
          {selfUser.firstName} {selfUser.lastName}
        </span>
      </div>
    </div>
  );
}

function CallTopBtn({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof Mic;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer flex-col items-center transition",
        active ? "text-rose-300" : "text-white",
      )}
    >
      <Icon className="size-4" />
      <span className="mt-0.5 text-[10px]">{label}</span>
    </button>
  );
}
