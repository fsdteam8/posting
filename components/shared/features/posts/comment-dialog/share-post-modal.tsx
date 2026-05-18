"use client";

import { useSharePost } from "@/hooks/posts/use-share-post";
import { Post } from "@/types/features/posts";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Globe,
  Link,
  Linkedin,
  Lock,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  SiFacebook,
  SiInstagram,
  SiTelegram,
  SiWhatsapp,
  SiX,
} from "react-icons/si";

// ─── Types ────────────────────────────────────────────────────────────────────

type Visibility = "public" | "friends" | "private";

interface SharePostModalProps {
  post: Post;
  accessToken: string;
  isOpen: boolean;
  onClose: () => void;
  loggedInUserId: string;
}

// ─── Visibility options config ────────────────────────────────────────────────

const VISIBILITY_OPTIONS: {
  value: Visibility;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "public",
    label: "Public",
    icon: <Globe className="w-4 h-4" />,
    description: "Anyone can see this",
  },
  {
    value: "friends",
    label: "Friends",
    icon: <Users className="w-4 h-4" />,
    description: "Only your connections",
  },
  {
    value: "private",
    label: "Only me",
    icon: <Lock className="w-4 h-4" />,
    description: "Just for you",
  },
];

// ─── External platform config ─────────────────────────────────────────────────

const getExternalPlatforms = (postUrl: string, shareText: string) => [
  {
    name: "Facebook",
    icon: <SiFacebook className="w-5 h-5" />,
    color: "#1877F2",
    bg: "#E7F0FD",
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
  },
  {
    name: "X (Twitter)",
    icon: <SiX className="w-5 h-5" />,
    color: "#000000",
    bg: "#F0F0F0",
    url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`,
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="w-5 h-5" />,
    color: "#0A66C2",
    bg: "#E8F0F9",
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
  },
  {
    name: "WhatsApp",
    icon: <SiWhatsapp className="w-5 h-5" />,
    color: "#25D366",
    bg: "#E8FAF0",
    url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl}`)}`,
  },
  {
    name: "Telegram",
    icon: <SiTelegram className="w-5 h-5" />,
    color: "#229ED9",
    bg: "#E5F4FB",
    url: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`,
  },
  {
    name: "Instagram",
    icon: <SiInstagram className="w-5 h-5" />,
    color: "#E1306C",
    bg: "#FDEEF4",
    // Instagram doesn't support direct URL sharing — copy to clipboard instead
    url: null,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SharePostModal({
  post,
  accessToken,
  isOpen,
  onClose,
}: SharePostModalProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"internal" | "external">(
    "internal",
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Construct post URL — adjust base URL to match your app's domain
  const postUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${post._id}`
      : `/posts/${post._id}`;

  const shareText = post.content?.slice(0, 100) ?? "Check out this post!";

  const platforms = getExternalPlatforms(postUrl, shareText);

  // Focus textarea when switching to internal tab
  useEffect(() => {
    if (activeTab === "internal" && isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [activeTab, isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const { mutate: sharePost, isPending } = useSharePost({
    accessToken,
    postId: post._id,
  });

  // ── Internal share handler ─────────────────────────────────────────────────
  const handleInternalShare = () => {
    sharePost(
      { content, visibility, status: "published" },
      {
        onSuccess: (res) => {
          if (res.success) onClose();
        },
      },
    );
  };

  // ── Copy link to clipboard ─────────────────────────────────────────────────
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("input");
      el.value = postUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Open external platform in new tab ─────────────────────────────────────
  const handleExternalShare = (platform: (typeof platforms)[number]) => {
    if (!platform.url) {
      // Instagram — no direct share URL, copy link instead
      handleCopyLink();
      return;
    }
    window.open(
      platform.url,
      "_blank",
      "noopener,noreferrer,width=600,height=480",
    );
  };

  const selectedVisibility = VISIBILITY_OPTIONS.find(
    (v) => v.value === visibility,
  )!;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ────────────────────────────────────────────────────── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* ── Modal ───────────────────────────────────────────────────────── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-120 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                  Share post
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                </button>
              </div>

              {/* ── Tabs ──────────────────────────────────────────────────── */}
              <div className="flex px-5 pt-4 gap-2">
                {(["internal", "external"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      activeTab === tab
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                        : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {tab === "internal"
                      ? "Share on Postin"
                      : "Share externally"}
                  </button>
                ))}
              </div>

              {/* ── Internal share ─────────────────────────────────────────── */}
              <AnimatePresence mode="wait">
                {activeTab === "internal" && (
                  <motion.div
                    key="internal"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.18 }}
                    className="px-5 pt-4 pb-5 space-y-4"
                  >
                    {/* Write something */}
                    <div className="rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                      <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Say something about this post…"
                        rows={3}
                        className="w-full px-4 pt-3 pb-2 text-[14px] text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-transparent resize-none outline-none"
                      />

                      {/* Original post preview inside composer */}
                      <div className="mx-3 mb-3 p-3 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
                        <p className="text-[12px] text-gray-400 dark:text-zinc-500 mb-1">
                          Original post
                        </p>
                        <p className="text-[13px] text-gray-600 dark:text-zinc-300 line-clamp-2">
                          {post.content ?? "No content"}
                        </p>
                      </div>
                    </div>

                    {/* Visibility selector */}
                    <div>
                      <p className="text-[12px] text-gray-400 dark:text-zinc-500 mb-2 font-medium uppercase tracking-wide">
                        Audience
                      </p>
                      <div className="flex gap-2">
                        {VISIBILITY_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setVisibility(option.value)}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-center transition-all ${
                              visibility === option.value
                                ? "border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-700"
                                : "border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700"
                            }`}
                          >
                            <span
                              className={`${
                                visibility === option.value
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-400 dark:text-zinc-500"
                              }`}
                            >
                              {option.icon}
                            </span>
                            <span
                              className={`text-[11px] font-medium ${
                                visibility === option.value
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-500 dark:text-zinc-400"
                              }`}
                            >
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Share button */}
                    <button
                      onClick={handleInternalShare}
                      disabled={isPending}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-semibold transition-colors"
                    >
                      {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sharing…
                        </span>
                      ) : (
                        `Share to ${selectedVisibility.label}`
                      )}
                    </button>
                  </motion.div>
                )}

                {/* ── External share ──────────────────────────────────────── */}
                {activeTab === "external" && (
                  <motion.div
                    key="external"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                    className="px-5 pt-4 pb-5 space-y-4"
                  >
                    {/* Platform grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {platforms.map((platform) => (
                        <button
                          key={platform.name}
                          onClick={() => handleExternalShare(platform)}
                          className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-sm transition-all active:scale-95"
                        >
                          {/* Icon bubble */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: platform.bg }}
                          >
                            <span style={{ color: platform.color }}>
                              {platform.icon}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-gray-600 dark:text-zinc-400">
                            {/* For Instagram, label changes since no direct share */}
                            {platform.name === "Instagram"
                              ? "Instagram*"
                              : platform.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Instagram note */}
                    <p className="text-[11px] text-gray-400 dark:text-zinc-600 text-center">
                      * Instagram doesn&rsquo;t support direct sharing — link
                      will be copied instead.
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-100 dark:bg-zinc-800" />
                      <span className="text-[12px] text-gray-400 dark:text-zinc-600">
                        or
                      </span>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-zinc-800" />
                    </div>

                    {/* Copy link row */}
                    <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
                      <Link className="w-4 h-4 text-gray-400 dark:text-zinc-500 shrink-0" />
                      <span className="flex-1 text-[12px] text-gray-500 dark:text-zinc-400 truncate font-mono">
                        {postUrl}
                      </span>
                      <button
                        onClick={handleCopyLink}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                          copied
                            ? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                            : "bg-white dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-600"
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
