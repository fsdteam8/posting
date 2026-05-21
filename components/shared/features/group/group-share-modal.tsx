"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, Link as LinkIcon, Linkedin } from "lucide-react";
import { useState } from "react";
import {
  SiFacebook,
  SiInstagram,
  SiTelegram,
  SiWhatsapp,
  SiX,
} from "react-icons/si";
import { toast } from "sonner";

interface Props {
  groupUserName: string;
  groupName: string;
  groupPrivacy: "public" | "private" | "closed";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getExternalPlatforms = (groupUrl: string, shareText: string) => [
  {
    name: "Facebook",
    icon: <SiFacebook className="w-5 h-5" />,
    color: "#1877F2",
    bg: "#E7F0FD",
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(groupUrl)}`,
  },
  {
    name: "X (Twitter)",
    icon: <SiX className="w-5 h-5" />,
    color: "#000000",
    bg: "#F0F0F0",
    url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(groupUrl)}&text=${encodeURIComponent(shareText)}`,
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="w-5 h-5" />,
    color: "#0A66C2",
    bg: "#E8F0F9",
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(groupUrl)}`,
  },
  {
    name: "WhatsApp",
    icon: <SiWhatsapp className="w-5 h-5" />,
    color: "#25D366",
    bg: "#E8FAF0",
    url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${groupUrl}`)}`,
  },
  {
    name: "Telegram",
    icon: <SiTelegram className="w-5 h-5" />,
    color: "#229ED9",
    bg: "#E5F4FB",
    url: `https://t.me/share/url?url=${encodeURIComponent(groupUrl)}&text=${encodeURIComponent(shareText)}`,
  },
  {
    name: "Instagram",
    icon: <SiInstagram className="w-5 h-5" />,
    color: "#E1306C",
    bg: "#FDEEF4",
    url: null,
  },
];

export default function GroupShareModal({
  groupUserName,
  groupName,
  groupPrivacy,
  open,
  onOpenChange,
}: Props) {
  const [copied, setCopied] = useState(false);

  const groupUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/groups/view/${groupUserName}`
      : `/groups/view/${groupUserName}`;

  const shareText = `Join ${groupName} on Postin`;
  const platforms = getExternalPlatforms(groupUrl, shareText);
  const isPrivate = groupPrivacy !== "public";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(groupUrl);
      setCopied(true);
      toast.success("Group link copied");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("input");
      el.value = groupUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      toast.success("Group link copied");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExternalShare = (platform: (typeof platforms)[number]) => {
    if (!platform.url) {
      handleCopyLink();
      return;
    }
    window.open(
      platform.url,
      "_blank",
      "noopener,noreferrer,width=600,height=480",
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 min-w-0">
          <DialogTitle>Share {groupName}</DialogTitle>
          <DialogDescription>
            {isPrivate
              ? "This group is not public — people you share the link with may need to request to join."
              : "Anyone with this link can view the group."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5 pt-3 space-y-4 min-w-0">
          <div className="grid grid-cols-3 gap-3">
            {platforms.map((platform) => (
              <button
                key={platform.name}
                type="button"
                onClick={() => handleExternalShare(platform)}
                className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-border hover:border-muted-foreground/40 hover:shadow-sm transition-all active:scale-95"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: platform.bg }}
                >
                  <span style={{ color: platform.color }}>{platform.icon}</span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {platform.name === "Instagram" ? "Instagram*" : platform.name}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            * Instagram doesn&rsquo;t support direct sharing — link will be
            copied instead.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[12px] text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/50 min-w-0">
            <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="flex-1 min-w-0 text-[12px] text-muted-foreground truncate font-mono">
              {groupUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                copied
                  ? "bg-green-50 text-green-600"
                  : "bg-background border border-border hover:bg-muted"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
