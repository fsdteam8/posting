"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  Briefcase,
  Clock,
  Flag,
  Hash,
  Image as ImageIcon,
  Lightbulb,
  Search,
  Smile,
  Sticker,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onPick: (emoji: string) => void;
  onClose: () => void;
}

type Tab = "emoji" | "smile" | "sticker" | "gif";

const RECENT = [
  "🤣",
  "😎",
  "😟",
  "😳",
  "😘",
  "😢",
  "😣",
  "🙄",
  "🥺",
  "😬",
  "😒",
];

const SMILES = [
  "😀", "😄", "🧑‍🍳", "🥰", "🤩", "🥺", "😣", "🧑‍🤝‍🧑", "😋",
  "🤣", "😁", "🥶", "😊", "🧑", "😡", "🧑‍🌾", "😉", "😌",
  "😶", "😳", "🥺", "🤩", "🤐", "🤨", "😴", "😒", "😎",
];

const TABS: { key: Tab; icon: typeof Smile }[] = [
  { key: "emoji", icon: Smile },
  { key: "smile", icon: Smile },
  { key: "sticker", icon: Sticker },
  { key: "gif", icon: ImageIcon },
];

export function EmojiPicker({ onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("emoji");
  const [q, setQ] = useState("");

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const all = q ? SMILES.filter((s) => s.includes(q)) : SMILES;

  return (
    <div
      ref={ref}
      className="w-85 overflow-hidden rounded-2xl border bg-card shadow-xl ring-1 ring-black/5"
    >
      <div className="flex items-center justify-around border-b px-4 py-2">
        {TABS.map((t) => {
          if (t.key === "gif") {
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "cursor-pointer text-[11px] font-bold tracking-wider",
                  tab === t.key ? "text-foreground" : "text-muted-foreground",
                )}
              >
                GIF
              </button>
            );
          }
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex size-7 cursor-pointer items-center justify-center rounded-md transition",
                tab === t.key ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <t.icon className="size-5" />
            </button>
          );
        })}
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-8 w-full rounded-full bg-muted/40 pl-8 pr-3 text-[12px] outline-none focus:bg-card"
          />
        </div>
      </div>

      <div className="px-3 pb-2">
        <p className="mb-1 text-[11px] font-medium text-muted-foreground">
          Recently used
        </p>
        <div className="grid grid-cols-9 gap-1">
          {RECENT.map((e, i) => (
            <button
              key={`r-${i}`}
              onClick={() => onPick(e)}
              className="flex aspect-square cursor-pointer items-center justify-center rounded text-[16px] transition hover:bg-muted"
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-50 overflow-y-auto px-3 pb-3">
        <p className="mb-1 text-[11px] font-medium text-muted-foreground">
          Smile and emotion
        </p>
        <div className="grid grid-cols-9 gap-1">
          {all.map((e, i) => (
            <button
              key={`s-${i}`}
              onClick={() => onPick(e)}
              className="flex aspect-square cursor-pointer items-center justify-center rounded text-[16px] transition hover:bg-muted"
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t px-3 py-2 text-muted-foreground">
        <Clock className="size-4" />
        <Smile className="size-4 text-primary" />
        <Activity className="size-4" />
        <Briefcase className="size-4" />
        <Activity className="size-4" />
        <ImageIcon className="size-4" />
        <Lightbulb className="size-4" />
        <Hash className="size-4" />
        <Flag className="size-4" />
      </div>
    </div>
  );
}
