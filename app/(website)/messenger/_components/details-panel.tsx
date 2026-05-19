"use client";

import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/types/messenger";
import { format } from "date-fns";
import {
  Bell,
  BellOff,
  CircleMinus,
  FileText,
  Link2,
  Phone,
  PlayCircle,
  Search,
  Trash2,
  TriangleAlert,
  User,
  UserPlus,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Avatar } from "./avatar";
import {
  getConversationAvatar,
  getConversationTitle,
  getOtherParticipant,
} from "./helpers";
import { ImageViewer } from "./image-viewer";
import { useMessenger } from "./messenger-context";

type Tab = "photos" | "videos" | "links" | "files";

interface Props {
  conversation: Conversation;
  meId: string;
  messages: Message[];
  onOpenSearch: () => void;
}

export function DetailsPanel({
  conversation,
  meId,
  messages,
  onOpenSearch,
}: Props) {
  const {
    openTheme,
    openNicknames,
    openNewGroup,
    openCall,
    openReport,
    requestBlock,
    requestDeleteChat,
    mutedIds,
    toggleMuteConv,
  } = useMessenger();
  const [tab, setTab] = useState<Tab>("photos");
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  const isGroup = conversation.isGroup;
  const title = getConversationTitle(conversation, meId);
  const avatar = getConversationAvatar(conversation, meId);
  const other = getOtherParticipant(conversation, meId);
  const muted = mutedIds.has(conversation._id);

  const { photos, videos, files, links } = useMemo(() => {
    const photos: Message[] = [];
    const videos: Message[] = [];
    const files: Message[] = [];
    const links: { url: string; from: Message }[] = [];
    for (const m of messages) {
      if (m.type === "image" && m.media?.url) photos.push(m);
      else if (m.type === "video" && m.media?.url) videos.push(m);
      else if (m.type === "file" && m.media?.url) files.push(m);
      if (m.text) {
        const matches = m.text.match(/https?:\/\/[^\s]+/g);
        if (matches) for (const url of matches) links.push({ url, from: m });
      }
    }
    return { photos, videos, files, links };
  }, [messages]);

  return (
    <aside className="hidden h-full w-85 shrink-0 flex-col overflow-y-auto border-l bg-card lg:flex">
      <div className="flex flex-col items-center px-6 pt-8 pb-4">
        <div className="relative size-24 overflow-hidden rounded-full bg-muted">
          <Avatar src={avatar} alt={title} sizes="96px" isGroup={isGroup} />
        </div>
        <p className="mt-4 text-center text-[17px] font-semibold">{title}</p>
        {!isGroup && other?.username && (
          <p className="text-[12px] text-muted-foreground">@{other.username}</p>
        )}

        <div className="mt-5 grid w-full grid-cols-4 gap-1">
          <ActionChip
            icon={Phone}
            label="Audio"
            onClick={() => other && openCall("audio", other)}
            disabled={!other}
          />
          <ActionChip
            icon={Video}
            label="Video"
            onClick={() => other && openCall("video", other)}
            disabled={!other}
          />
          <ActionChip
            icon={User}
            label="Profile"
            href={other?.username ? `/${other.username}` : undefined}
          />
          <ActionChip
            icon={muted ? Bell : BellOff}
            label={muted ? "Unmute" : "Mute"}
            onClick={() => toggleMuteConv(conversation._id)}
          />
        </div>
      </div>

      <Section title="Customisation">
        <button
          type="button"
          onClick={openTheme}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-[13.5px] transition hover:bg-muted/40"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/15">
            <span className="size-2.5 rounded-full bg-primary" />
          </span>
          <span>Theme</span>
        </button>
        <button
          type="button"
          onClick={openNicknames}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-[13.5px] transition hover:bg-muted/40"
        >
          <span className="flex size-5 items-center justify-center text-muted-foreground">
            <span className="text-[14px] font-semibold tracking-tight">Aa</span>
          </span>
          <span>Nicknames</span>
        </button>
      </Section>

      <Section title="More actions">
        <button
          type="button"
          onClick={() => openNewGroup(other ? [other] : [])}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-[13.5px] transition hover:bg-muted/40"
        >
          <UserPlus className="size-4" />
          <span>
            {isGroup
              ? "Add members"
              : `Create group chat with ${other?.firstName ?? ""}`}
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-[13.5px] transition hover:bg-muted/40"
        >
          <Search className="size-4" />
          <span>Search in conversation</span>
        </button>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {muted ? (
              <BellOff className="size-4" />
            ) : (
              <Bell className="size-4" />
            )}
            <span className="text-[13.5px]">Notifications &amp; sounds</span>
          </div>
          <button
            type="button"
            onClick={() => toggleMuteConv(conversation._id)}
            className={cn(
              "relative h-5 w-9 cursor-pointer rounded-full transition",
              !muted ? "bg-primary" : "bg-muted",
            )}
            aria-label="Toggle notifications"
          >
            <span
              className={cn(
                "absolute top-0.5 size-4 rounded-full bg-card shadow transition-all",
                !muted ? "left-4" : "left-0.5",
              )}
            />
          </button>
        </div>
      </Section>

      <Section title="Privacy and support">
        <button
          type="button"
          onClick={() => other && requestBlock(other, conversation._id)}
          disabled={!other}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-[13.5px] transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CircleMinus className="size-4" />
          <span>Block</span>
        </button>
        <button
          type="button"
          onClick={() => openReport(title)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-[13.5px] transition hover:bg-muted/40"
        >
          <TriangleAlert className="size-4" />
          <span>Report</span>
        </button>
        <button
          type="button"
          onClick={() => requestDeleteChat(conversation._id)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-[13.5px] text-destructive transition hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          <span>Delete chat</span>
        </button>
      </Section>

      <div className="mt-2 border-t px-6 pt-3">
        <div className="flex items-center justify-between">
          <TabBtn
            label="Photos"
            icon={
              <span className="flex size-4 items-center justify-center">
                <span className="size-3 rounded-sm border" />
              </span>
            }
            active={tab === "photos"}
            onClick={() => setTab("photos")}
          />
          <TabBtn
            label="Videos"
            icon={<PlayCircle className="size-3.5" />}
            active={tab === "videos"}
            onClick={() => setTab("videos")}
          />
          <TabBtn
            label="Links"
            icon={<Link2 className="size-3.5" />}
            active={tab === "links"}
            onClick={() => setTab("links")}
          />
          <TabBtn
            label="Files"
            icon={<FileText className="size-3.5" />}
            active={tab === "files"}
            onClick={() => setTab("files")}
          />
        </div>

        <div className="py-4">
          {tab === "photos" && (
            <PhotosGrid items={photos} onOpen={(src) => setViewerSrc(src)} />
          )}
          {tab === "videos" && <VideosGrid items={videos} />}
          {tab === "links" && <LinksList items={links} />}
          {tab === "files" && <FilesList items={files} />}
        </div>
      </div>

      {viewerSrc && (
        <ImageViewer src={viewerSrc} onClose={() => setViewerSrc(null)} />
      )}
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 px-6 pt-2">
      <p className="text-[12px] font-medium text-muted-foreground">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ActionChip({
  icon: Icon,
  label,
  onClick,
  href,
  disabled,
}: {
  icon: typeof Phone;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const inner = (
    <span className="flex size-9 items-center justify-center rounded-full bg-muted transition hover:bg-muted/70">
      <Icon className="size-4" />
    </span>
  );
  if (href) {
    return (
      <a
        href={href}
        className="flex cursor-pointer flex-col items-center gap-1 text-muted-foreground"
      >
        {inner}
        <span className="text-[10.5px]">{label}</span>
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-1 text-muted-foreground",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
    >
      {inner}
      <span className="text-[10.5px]">{label}</span>
    </button>
  );
}

function TabBtn({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 border-b-2 pb-2 text-[12px] font-medium transition",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyMedia({ label }: { label: string }) {
  return (
    <div className="flex h-24 items-center justify-center text-[11px] text-muted-foreground">
      No {label} yet
    </div>
  );
}

function PhotosGrid({
  items,
  onOpen,
}: {
  items: Message[];
  onOpen: (src: string) => void;
}) {
  if (items.length === 0) return <EmptyMedia label="photos" />;
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {items.map((m) => (
        <button
          key={m._id}
          type="button"
          onClick={() => onOpen(m.media!.url!)}
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-md"
        >
          <Image
            src={m.media!.url!}
            alt=""
            fill
            sizes="100px"
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
}

function VideosGrid({ items }: { items: Message[] }) {
  if (items.length === 0) return <EmptyMedia label="videos" />;
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {items.map((m) => (
        <a
          key={m._id}
          href={m.media!.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-square overflow-hidden rounded-md bg-muted"
        >
          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
            <PlayCircle className="size-6 text-white" />
          </span>
        </a>
      ))}
    </div>
  );
}

function LinksList({
  items,
}: {
  items: { url: string; from: Message }[];
}) {
  if (items.length === 0) return <EmptyMedia label="links" />;
  return (
    <div className="flex flex-col gap-3">
      {items.map((l, i) => (
        <a
          key={i}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg p-1 hover:bg-muted/40"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Link2 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px]">{l.url}</p>
            <p className="text-[11px] text-muted-foreground">
              {format(new Date(l.from.createdAt), "d MMM yyyy")}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}

function FilesList({ items }: { items: Message[] }) {
  if (items.length === 0) return <EmptyMedia label="files" />;
  return (
    <div className="flex flex-col gap-3">
      {items.map((m) => {
        const ext =
          (m.media?.fileName?.split(".").pop() || "file").toUpperCase();
        const color =
          ext === "PDF"
            ? "bg-rose-500"
            : ext === "ZIP"
              ? "bg-violet-500"
              : "bg-emerald-500";
        return (
          <a
            key={m._id}
            href={m.media!.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg p-1 hover:bg-muted/40"
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-md text-white",
                color,
              )}
            >
              <FileText className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium">
                {m.media?.fileName || "Attachment"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {m.media?.size
                  ? `${(m.media.size / 1024).toFixed(1)} KB`
                  : ext}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {format(new Date(m.createdAt), "dd/MM/yyyy")}
            </span>
          </a>
        );
      })}
    </div>
  );
}
