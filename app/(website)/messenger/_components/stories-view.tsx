"use client";

import { useStories } from "@/hooks/features/messenger/api/use-stories";
import { Loader2, MessageCircle, Plus } from "lucide-react";
import Image from "next/image";
import { getUserAvatar, userFullName } from "./helpers";
import { useMessenger } from "./messenger-context";

export function StoriesView() {
  const { accessToken, me, openNewGroup } = useMessenger();
  const { data, isLoading } = useStories({ accessToken });
  const groups = data?.data ?? [];

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto bg-card px-8 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold">Stories</h2>
        <button
          type="button"
          onClick={() => openNewGroup()}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-[12.5px] font-medium text-primary-foreground hover:opacity-90"
        >
          <MessageCircle className="size-4" />
          New Message
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          className="group relative aspect-3/2 cursor-pointer overflow-hidden rounded-2xl bg-linear-to-br from-primary/30 to-primary/10"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground">
            <span className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-primary/60 bg-card">
              <Plus className="size-6 text-primary" />
            </span>
            <span className="mt-2 text-[13px] font-medium">
              Create Your Story
            </span>
          </div>
          <div className="absolute left-3 top-3 size-7 overflow-hidden rounded-full ring-2 ring-card">
            <Image
              src={getUserAvatar(me)}
              alt={userFullName(me)}
              fill
              sizes="28px"
              className="object-cover"
            />
          </div>
        </button>

        {isLoading ? (
          <div className="col-span-full flex h-40 items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          groups.map((g) => {
            const first = g.stories[0]?.media[0];
            return (
              <div
                key={g.user._id}
                className="relative aspect-3/2 overflow-hidden rounded-2xl bg-muted"
              >
                {first?.thumbnail || first?.url ? (
                  <Image
                    src={first.thumbnail || first.url}
                    alt={userFullName(g.user)}
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute inset-x-3 top-3 flex items-center gap-1">
                  {g.stories.map((_, i) => (
                    <span
                      key={i}
                      className="h-0.5 flex-1 rounded-full bg-white/70"
                    />
                  ))}
                  <span className="ml-1 text-[10px] font-medium text-white/90">
                    {g.stories.length}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                  <div className="relative size-6 overflow-hidden rounded-full ring-2 ring-white">
                    <Image
                      src={getUserAvatar(g.user)}
                      alt={userFullName(g.user)}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[12px] font-medium">
                    {userFullName(g.user)}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {!isLoading && groups.length === 0 && (
          <div className="col-span-full mt-2 text-[12.5px] text-muted-foreground">
            No stories from friends right now.
          </div>
        )}
      </div>
    </div>
  );
}
