"use client";

import { Button } from "@/components/ui/button";
import { baseURL } from "@/constants";
import { formatCount } from "@/lib/utils";
import { Group } from "@/types/features/groups";
import { useMutation } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";

interface GroupCardProps {
  group: Group;
  onClose?: () => void;
  accessToken: string;
}

export default function GroupCard({
  group,
  onClose,
  accessToken,
}: GroupCardProps) {
  const [isJoined, setIsJoined] = useState(false);
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey: ["discover-group-joining"],
    mutationFn: () =>
      fetch(`${baseURL}/groups/${group._id}/join`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((res) => res.json()),

    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      setIsJoined(true);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const memberCount = group.members.length;
  const displayMembers = group.members.slice(0, 3);
  const remainingMembers = Math.max(0, group.members.length - 3);

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-card border border-border shadow-lg">
      {/* Cover Image */}
      <div className="relative h-40 w-full bg-muted">
        {group.coverImage?.url && (
          <Image
            src={group.coverImage.url}
            alt={group.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 transition-all hover:bg-background"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Stats */}
        <div className="space-y-1">
          <h3
            className="font-semibold cursor-pointer hover:text-primary transition duration-300 text-foreground"
            onClick={() => router.push(`/groups/view/${group.groupUserName}`)}
          >
            {group.name}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {formatCount(memberCount)} members • 10+ posts a day
          </p>
          <p className="text-xs text-muted-foreground">{group.category}</p>
        </div>

        {/* Members Preview */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {displayMembers.map((member) => {
              const profileImage = member.profileImage.url;
              if (!profileImage) return;
              return (
                <div key={member._id} className="relative h-8 w-8 shrink-0">
                  <Image
                    src={member.profileImage.url}
                    alt={`${member.firstName} ${member.lastName}`}
                    fill
                    className="rounded-full border-2 border-card object-cover"
                  />
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {displayMembers[0]?.firstName}
            </span>
            {remainingMembers > 0 && (
              <span>
                {" "}
                and {remainingMembers} friend{remainingMembers > 1 ? "s" : ""}{" "}
                are members
              </span>
            )}
            {remainingMembers === 0 && displayMembers.length > 1 && (
              <span>
                {" "}
                and {displayMembers.length - 1} friend
                {displayMembers.length - 1 > 1 ? "s" : ""} are members
              </span>
            )}
          </p>
        </div>

        {/* Join Button */}
        {isJoined ? (
          <Button
            onClick={() => router.push(`/groups/view/${group._id}`)}
            className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors duration-200"
          >
            Visit Group
          </Button>
        ) : (
          <Button
            onClick={() => mutate()}
            disabled={isPending || isJoined}
            className="w-full bg-muted text-foreground hover:bg-muted/70 disabled:opacity-50 transition-colors"
          >
            {isPending && <Loader2 className="animate-spin" />} Join Group
          </Button>
        )}
      </div>
    </div>
  );
}
