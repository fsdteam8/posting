"use client";

import { MessageCircle } from "lucide-react";

export function EmptyChat() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center bg-card px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageCircle className="size-7" />
      </div>
      <p className="mt-4 text-[15px] font-semibold">Your messages</p>
      <p className="mt-1 max-w-xs text-[12.5px] text-muted-foreground">
        Select a conversation on the left, or tap the + button to start a new
        one.
      </p>
    </div>
  );
}
