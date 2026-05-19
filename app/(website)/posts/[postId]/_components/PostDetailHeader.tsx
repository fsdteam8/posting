"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Link2 } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  authorName: string;
  postId: string;
}

export function PostDetailHeader({ authorName, postId }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/posts/${postId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-fb-divider">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0"
          onClick={handleBack}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-fb-text-primary truncate">
            {authorName}&apos;s Post
          </p>
          <p className="text-[12px] text-fb-text-secondary">Permalink</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-full gap-1.5"
          onClick={handleCopyLink}
        >
          <Link2 className="w-4 h-4" />
          <span className="text-[13px] font-semibold">
            {copied ? "Copied" : "Copy link"}
          </span>
        </Button>
      </div>
    </div>
  );
}
