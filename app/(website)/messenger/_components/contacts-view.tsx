"use client";

import { useCreateDirectConversation } from "@/hooks/features/messenger/api/use-create-direct-conversation";
import { useFriends } from "@/hooks/features/messenger/api/use-friends";
import { Loader2, MessageCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "./avatar";
import { getUserAvatar, userFullName } from "./helpers";
import { useMessenger } from "./messenger-context";

export function ContactsView() {
  const router = useRouter();
  const { accessToken } = useMessenger();
  const [q, setQ] = useState("");
  const { data, isLoading } = useFriends({ accessToken, q, limit: 50 });
  const createDirect = useCreateDirectConversation({ accessToken });

  async function openChat(userId: string) {
    const res = await createDirect.mutateAsync({ userId });
    if (res?.data?._id) router.push(`/messenger/${res.data._id}`);
  }

  const friends = data?.data ?? [];

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto bg-card px-8 py-6">
      <h2 className="text-[20px] font-bold">Contacts</h2>

      <div className="mt-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search contacts"
          className="h-10 w-full rounded-full border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:border-primary/40 focus:bg-card"
        />
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : friends.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-muted-foreground">
            No contacts found.
          </p>
        ) : (
          friends.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <div className="relative size-11 overflow-hidden rounded-full bg-muted">
                  <Avatar
                    src={getUserAvatar(u)}
                    alt={userFullName(u)}
                    sizes="44px"
                  />
                </div>
                <div>
                  <p className="text-[14px] font-semibold leading-tight">
                    {userFullName(u)}
                  </p>
                  {u.username && (
                    <p className="text-[12px] text-muted-foreground">
                      @{u.username}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => openChat(u._id)}
                disabled={createDirect.isPending}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MessageCircle className="size-3.5" />
                Message
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
