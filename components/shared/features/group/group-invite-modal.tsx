"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InvitableFriend,
  useGetFriendsNotInGroup,
} from "@/hooks/features/groups/api/use-get-friends-not-in-group";
import { useInviteToGroup } from "@/hooks/features/groups/api/use-invite-to-group";
import { Check, Loader2, Search, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  groupId: string;
  groupName: string;
  accessToken: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GroupInviteModal({
  groupId,
  groupName,
  accessToken,
  open,
  onOpenChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFriendsNotInGroup({
    groupId,
    accessToken,
    enabled: open,
  });

  const { mutate: invite, isPending: isInviting, variables: invitingId } =
    useInviteToGroup({ groupId, accessToken });

  const friends = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return friends;
    const q = search.toLowerCase();
    return friends.filter((f) =>
      `${f.firstName} ${f.lastName} ${f.username}`.toLowerCase().includes(q),
    );
  }, [friends, search]);

  // Reset local invited state when modal closes
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setSearch("");
      setInvitedIds(new Set());
    }
  }

  // Infinite scroll
  useEffect(() => {
    if (!open) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleInvite = (friend: InvitableFriend) => {
    invite(friend._id, {
      onSuccess: (res) => {
        if (res.success) {
          setInvitedIds((prev) => {
            const next = new Set(prev);
            next.add(friend._id);
            return next;
          });
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Invite friends to {groupName}</DialogTitle>
          <DialogDescription>
            Pick the friends you&apos;d like to invite to this group.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search friends"
              className="w-full pl-9 pr-3 py-2 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto px-2 pb-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}

          {isError && (
            <div className="px-5 py-8 text-center text-sm text-red-500">
              {error?.message ?? "Failed to load friends."}
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "No friends match your search."
                  : "No friends available to invite."}
              </p>
            </div>
          )}

          {filtered.map((friend) => {
            const fullName = `${friend.firstName} ${friend.lastName}`;
            const avatar = friend.profileImage?.url;
            const isInvited = invitedIds.has(friend._id);
            const isLoading = isInviting && invitingId === friend._id;

            return (
              <div
                key={friend._id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/60"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={fullName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-primary-foreground bg-primary">
                      {friend.firstName.charAt(0)}
                      {friend.lastName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-foreground truncate">
                    {fullName}
                  </p>
                  {friend.username && (
                    <p className="text-[12px] text-muted-foreground truncate">
                      @{friend.username}
                    </p>
                  )}
                </div>

                {isInvited ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled
                    className="gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Invited
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleInvite(friend)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Invite"
                    )}
                  </Button>
                )}
              </div>
            );
          })}

          <div ref={sentinelRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
