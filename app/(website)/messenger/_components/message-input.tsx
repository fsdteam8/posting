"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/messenger";
import {
  FileText,
  Mic,
  Paperclip,
  Play,
  Send,
  Smile,
  Square,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmojiPicker } from "./emoji-picker";
import { userFullName } from "./helpers";

interface Props {
  replyTo: Message | null;
  disabled?: boolean;
  placeholder?: string;
  onClearReply: () => void;
  /**
   * Send one logical message. If `files` is provided each entry becomes its own
   * message; the `text` (if any) rides on the FIRST file as a caption.
   * Text-only sends pass `text` with no files.
   */
  onSend: (args: { text?: string; files?: File[] }) => void;
}

type StagedAttachment = {
  id: string;
  file: File;
  previewUrl: string;
  kind: "image" | "video" | "audio" | "file";
};

function classifyFile(file: File): StagedAttachment["kind"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

export function MessageInput({
  replyTo,
  disabled,
  placeholder = "Your messages...",
  onClearReply,
  onSend,
}: Props) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [staged, setStaged] = useState<StagedAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<Blob[]>([]);
  const recStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecTime((r) => r + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  // Revoke object URLs on unmount / clear; tear down any active recording.
  useEffect(() => {
    return () => {
      staged.forEach((s) => URL.revokeObjectURL(s.previewUrl));
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        mr.onstop = null;
        try {
          mr.stop();
        } catch {
          /* noop */
        }
      }
      recStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickAudioMimeType(): string {
    if (typeof MediaRecorder === "undefined") return "";
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
    return "";
  }

  async function startRecording() {
    if (recording) return;
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      alert("Voice recording isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickAudioMimeType();
      const mr = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = mr;
      recStreamRef.current = stream;
      mr.start();
      setRecTime(0);
      setRecording(true);
    } catch (err) {
      console.error("Microphone access failed", err);
      alert(
        "Couldn't access the microphone. Check the site's mic permission and try again.",
      );
    }
  }

  function teardownRecording() {
    recStreamRef.current?.getTracks().forEach((t) => t.stop());
    recStreamRef.current = null;
    mediaRecorderRef.current = null;
    recChunksRef.current = [];
    setRecording(false);
    setRecTime(0);
  }

  function cancelRecording() {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = null;
      try {
        mr.stop();
      } catch {
        /* noop */
      }
    }
    teardownRecording();
  }

  function finalizeAndSendRecording() {
    const chunks = recChunksRef.current;
    if (chunks.length === 0) {
      teardownRecording();
      return;
    }
    const type = chunks[0].type || "audio/webm";
    const ext = type.includes("mp4")
      ? "m4a"
      : type.includes("ogg")
        ? "ogg"
        : "webm";
    const blob = new Blob(chunks, { type });
    const file = new File([blob], `voice-${Date.now()}.${ext}`, { type });
    onSend({ files: [file] });
    teardownRecording();
  }

  function sendRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr) {
      teardownRecording();
      return;
    }
    if (mr.state === "inactive") {
      finalizeAndSendRecording();
      return;
    }
    mr.onstop = () => finalizeAndSendRecording();
    try {
      mr.stop();
    } catch {
      teardownRecording();
    }
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed && staged.length === 0) return;
    onSend({
      text: trimmed || undefined,
      files: staged.length > 0 ? staged.map((s) => s.file) : undefined,
    });
    // Cleanup
    staged.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    setStaged([]);
    setText("");
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const next: StagedAttachment[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      kind: classifyFile(file),
    }));
    setStaged((prev) => [...prev, ...next]);
    e.target.value = "";
  }

  function removeStaged(id: string) {
    setStaged((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  }

  const mm = String(Math.floor(recTime / 60)).padStart(1, "0");
  const ss = String(recTime % 60).padStart(2, "0");
  const canSend = (text.trim().length > 0 || staged.length > 0) && !disabled;

  return (
    <div className="border-t bg-card px-4 py-3">
      {replyTo && (
        <div className="mx-1 mb-2 flex items-start gap-2 rounded-lg border-l-2 border-primary bg-muted/40 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-primary">
              Replying to {userFullName(replyTo.sender)}
            </p>
            <p className="truncate text-[12px] text-muted-foreground">
              {replyTo.text || `[${replyTo.type}]`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClearReply}
            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Clear reply"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {staged.length > 0 && (
        <div className="mx-1 mb-2 flex flex-wrap items-center gap-2 rounded-xl border bg-muted/30 p-2">
          {staged.map((s) => (
            <StagedChip
              key={s.id}
              attachment={s}
              onRemove={() => removeStaged(s.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex size-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary"
            aria-label="Add more"
            title="Add more"
          >
            <Paperclip className="size-4" />
          </button>
        </div>
      )}

      {recording ? (
        <div className="flex items-center gap-3 rounded-full bg-muted/40 px-4 py-2">
          <button
            type="button"
            onClick={cancelRecording}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted text-foreground"
            aria-label="Cancel recording"
            title="Cancel"
          >
            <Square className="size-3.5 fill-current" />
          </button>
          <div className="flex-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/30">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
          <span className="w-10 text-right text-[12px] tabular-nums text-muted-foreground">
            {mm}:{ss}
          </span>
          <button
            type="button"
            onClick={sendRecording}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
            aria-label="Send voice message"
            title="Send"
          >
            <Send className="size-4" />
          </button>
        </div>
      ) : (
        <div className="relative flex items-center gap-2 rounded-full bg-muted/40 pl-3 pr-1.5">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Attach"
          >
            <Paperclip className="size-5" />
          </button>

          <input
            ref={inputRef}
            disabled={disabled}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              staged.length > 0 ? "Add a caption..." : placeholder
            }
            className={cn(
              "flex-1 bg-transparent py-2.5 text-[13.5px] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
            )}
          />

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={disabled}
              onClick={startRecording}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Voice"
            >
              <Mic className="size-5" />
            </button>
            <div className="relative">
              <button
                type="button"
                disabled={disabled}
                onClick={() => setShowEmoji((v) => !v)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Emoji"
              >
                <Smile className="size-5" />
              </button>
              {showEmoji && (
                <div className="absolute bottom-12 right-0 z-50">
                  <EmojiPicker
                    onPick={(em) => {
                      setText((t) => t + em);
                      inputRef.current?.focus();
                    }}
                    onClose={() => setShowEmoji(false)}
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition",
                canSend
                  ? "cursor-pointer text-primary hover:bg-primary/10"
                  : "cursor-not-allowed text-muted-foreground",
              )}
              aria-label="Send"
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StagedChip({
  attachment,
  onRemove,
}: {
  attachment: StagedAttachment;
  onRemove: () => void;
}) {
  return (
    <div className="group relative size-16 overflow-hidden rounded-lg border bg-card">
      {attachment.kind === "image" && (
        // Local blob URL — next/image optimization isn't useful here
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.previewUrl}
          alt={attachment.file.name}
          className="h-full w-full object-cover"
        />
      )}
      {attachment.kind === "video" && (
        <div className="flex h-full w-full items-center justify-center bg-black/80 text-white">
          <Play className="size-5" />
        </div>
      )}
      {attachment.kind === "audio" && (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          <Mic className="size-5" />
        </div>
      )}
      {attachment.kind === "file" && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center text-muted-foreground">
          <FileText className="size-5" />
          <span className="truncate text-[9px] leading-none">
            {attachment.file.name}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="absolute right-1 top-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white shadow opacity-90 hover:bg-black"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
