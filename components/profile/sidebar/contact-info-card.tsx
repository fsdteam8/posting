"use client";

import { Profile, SocialUrl } from "@/hooks/profile/use-profile";
import { useUpdateProfile } from "@/hooks/profile/use-update-profile";
import {
  Check,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactInfoCardProps {
  profile: Profile;
  isOwner: boolean;
  accessToken: string;
}

interface FormState {
  phone: string;
  website: string;
  socialLinks: SocialLinkEntry[];
}

interface SocialLinkEntry {
  id: string;
  platform: string;
  url: string;
}

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS = [
  { value: "instagram", label: "Instagram", color: "#E1306C", bg: "#fce4ec" },
  { value: "x", label: "X (Twitter)", color: "#000000", bg: "#f3f4f6" },
  { value: "linkedin", label: "LinkedIn", color: "#0A66C2", bg: "#e3f0fb" },
  { value: "facebook", label: "Facebook", color: "#1877F2", bg: "#e7f0fd" },
  { value: "youtube", label: "YouTube", color: "#FF0000", bg: "#fdecea" },
  { value: "tiktok", label: "TikTok", color: "#010101", bg: "#f3f4f6" },
  { value: "github", label: "GitHub", color: "#24292e", bg: "#f3f4f6" },
  { value: "pinterest", label: "Pinterest", color: "#E60023", bg: "#fdecea" },
  { value: "snapchat", label: "Snapchat", color: "#FFFC00", bg: "#fffde7" },
  { value: "twitch", label: "Twitch", color: "#9146FF", bg: "#f0ebff" },
  { value: "reddit", label: "Reddit", color: "#FF4500", bg: "#fdecea" },
  { value: "discord", label: "Discord", color: "#5865F2", bg: "#eef0fd" },
  { value: "other", label: "Other", color: "#6b7280", bg: "#f3f4f6" },
] as const;

function getPlatform(value: string) {
  return (
    PLATFORMS.find((p) => p.value === value) ?? PLATFORMS[PLATFORMS.length - 1]
  );
}

// ─── Platform icon (SVG inline) ───────────────────────────────────────────────

function PlatformIcon({
  platform,
  size = 14,
}: {
  platform: string;
  size?: number;
}) {
  const p = getPlatform(platform);

  const icons: Record<string, React.ReactNode> = {
    instagram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    facebook: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    youtube: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
    github: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
    pinterest: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
    tiktok: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    snapchat: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="#FFFC00"
        stroke="#ccc"
        strokeWidth="0.5"
      >
        <path d="M12.017 0C8.396 0 7.94.015 6.719.072 5.5.129 4.663.307 3.93.579a5.98 5.98 0 0 0-2.163 1.408A5.98 5.98 0 0 0 .359 4.15C.087 4.883-.091 5.72-.148 6.94-.205 8.16-.22 8.617-.22 12.237s.015 4.078.072 5.298c.057 1.22.235 2.057.507 2.79a5.98 5.98 0 0 0 1.408 2.163 5.98 5.98 0 0 0 2.163 1.408c.733.272 1.57.45 2.79.507 1.22.057 1.677.072 5.297.072s4.078-.015 5.298-.072c1.22-.057 2.057-.235 2.79-.507a5.98 5.98 0 0 0 2.163-1.408 5.98 5.98 0 0 0 1.408-2.163c.272-.733.45-1.57.507-2.79.057-1.22.072-1.677.072-5.297s-.015-4.078-.072-5.298c-.057-1.22-.235-2.057-.507-2.79a5.98 5.98 0 0 0-1.408-2.163A5.98 5.98 0 0 0 20.105.579C19.372.307 18.535.129 17.315.072 16.095.015 15.638 0 12.017 0z" />
      </svg>
    ),
    twitch: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
    reddit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
    discord: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={p.color}>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.133 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  };

  return (
    <span className="inline-flex items-center justify-center">
      {icons[platform] ?? <Globe size={size} className="text-gray-400" />}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

function toFormEntries(links: SocialUrl[]): SocialLinkEntry[] {
  return links.map((l, i) => ({
    id: String(i),
    platform: l.platform,
    url: l.url,
  }));
}

function toPayload(entries: SocialLinkEntry[]): SocialUrl[] {
  return entries
    .filter((e) => e.platform && e.url.trim())
    .map(({ platform, url }) => ({ platform, url: url.trim() }));
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContactInfoCard({
  profile,
  isOwner,
  accessToken,
}: ContactInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const buildForm = (): FormState => ({
    phone: profile.phone ?? "",
    website: profile.website ?? "",
    socialLinks: toFormEntries(profile.socialLinks ?? []),
  });

  const [form, setForm] = useState<FormState>(buildForm);
  const { mutate, isPending } = useUpdateProfile({ accessToken });

  // Re-sync when profile refetches
  useEffect(() => {
    if (!isEditing) setForm(buildForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const updateLink = (
    id: string,
    key: keyof SocialLinkEntry,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((l) =>
        l.id === id ? { ...l, [key]: value } : l,
      ),
    }));
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { id: String(Date.now()), platform: "instagram", url: "" },
      ],
    }));
  };

  const removeLink = (id: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((l) => l.id !== id),
    }));
  };

  const handleSave = () => {
    mutate(
      {
        phone: form.phone.trim(),
        website: form.website.trim(),
        socialLinks: toPayload(form.socialLinks),
      },
      {
        onSuccess: (res) => {
          if (res.success) setIsEditing(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setForm(buildForm());
    setIsEditing(false);
  };

  const hasAny =
    profile.email ||
    profile.phone ||
    profile.website ||
    (profile.socialLinks ?? []).length > 0;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">Contact Info</h3>

        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0"
            aria-label="Edit contact info"
          >
            <Pencil size={14} className="text-gray-400" />
          </button>
        )}

        {isOwner && isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
            >
              <X size={14} className="text-gray-400" />
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="p-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={14} className="text-green-500 animate-spin" />
              ) : (
                <Check size={14} className="text-green-500" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── View Mode ── */}
      {!isEditing && (
        <div className="flex flex-col gap-0.5">
          {!hasAny &&
            (isOwner ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[13px] text-blue-400 hover:underline cursor-pointer bg-transparent border-0 p-0 italic text-left"
              >
                + Add contact info
              </button>
            ) : (
              <p className="text-[13px] text-gray-400 italic">
                No contact info added.
              </p>
            ))}

          {/* Social links */}
          {(profile.socialLinks ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 py-2">
              {profile.socialLinks.map((link, i) => {
                const p = getPlatform(link.platform);
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={p.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium no-underline hover:opacity-80 transition-opacity"
                    style={{ background: p.bg, color: p.color }}
                  >
                    <PlatformIcon platform={link.platform} size={13} />
                    {p.label}
                    <ExternalLink size={10} className="opacity-60" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Email — always read-only */}
          {profile.email && (
            <div className="flex items-center gap-3 py-2 border-t border-gray-50">
              <Mail size={15} className="text-gray-400 shrink-0" />
              <a
                href={`mailto:${profile.email}`}
                className="text-[12.5px] text-blue-500 hover:underline break-all"
              >
                {profile.email}
              </a>
            </div>
          )}

          {/* Phone */}
          {profile.phone && (
            <div className="flex items-center gap-3 py-2 border-t border-gray-50">
              <Phone size={15} className="text-gray-400 shrink-0" />
              <span className="text-[12.5px] text-gray-700">
                {profile.phone}
              </span>
            </div>
          )}

          {/* Website */}
          {profile.website && (
            <div className="flex items-center gap-3 py-2 border-t border-gray-50">
              <Globe size={15} className="text-gray-400 shrink-0" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] text-blue-500 hover:underline break-all"
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Edit Mode ── */}
      {isEditing && (
        <div className="flex flex-col gap-4">
          {/* Social links */}
          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
              Social Links
            </label>

            {form.socialLinks.length === 0 && (
              <p className="text-[12.5px] text-gray-400 italic">
                No social links yet.
              </p>
            )}

            {form.socialLinks.map((link) => {
              const p = getPlatform(link.platform);
              return (
                <div key={link.id} className="flex items-center gap-2">
                  {/* Platform select */}
                  <div className="relative shrink-0">
                    <select
                      value={link.platform}
                      onChange={(e) =>
                        updateLink(link.id, "platform", e.target.value)
                      }
                      className="appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-[12.5px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all cursor-pointer"
                      style={{ minWidth: 130 }}
                    >
                      {PLATFORMS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <PlatformIcon platform={link.platform} size={13} />
                    </span>
                  </div>

                  {/* URL input */}
                  <input
                    value={link.url}
                    onChange={(e) => updateLink(link.id, "url", e.target.value)}
                    placeholder={`${p.label} URL`}
                    className={`${inputCls} flex-1`}
                  />

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-0 shrink-0"
                  >
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addLink}
              className="inline-flex items-center gap-1.5 text-[12.5px] text-blue-500 hover:text-blue-700 cursor-pointer bg-transparent border-0 p-0 w-fit font-medium transition-colors"
            >
              <Plus size={13} />
              Add social link
            </button>
          </div>

          {/* Email — read only in edit mode too */}
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
              Email
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-100 px-3 py-2">
              <Mail size={14} className="text-gray-400 shrink-0" />
              <span className="text-[13px] text-gray-400 select-none">
                {profile.email}
              </span>
              <span className="ml-auto text-[10.5px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
                locked
              </span>
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
              Phone
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+1 234 567 8900"
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>

          {/* Website */}
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
              Website
            </label>
            <div className="relative">
              <Globe
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://yourwebsite.com"
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
