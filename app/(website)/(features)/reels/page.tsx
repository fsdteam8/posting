"use client";

import { Play } from "lucide-react";

const Page = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Reel Card Preview */}
        <div className="relative h-125 w-70 rounded-2xl bg-zinc-900 shadow-2xl flex items-center justify-center border border-zinc-800">
          <Play className="size-16 text-white opacity-80" />

          {/* Vertical gradient overlay */}
          <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-black/70 via-transparent to-black/30" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white tracking-wide">
          Reels Page
        </h1>

        <p className="text-sm text-zinc-400">Short videos will appear here</p>
      </div>
    </div>
  );
};

export default Page;
