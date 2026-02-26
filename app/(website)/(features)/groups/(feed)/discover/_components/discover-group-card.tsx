"use client";

import { Button } from "@/components/ui/button";
import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
import { Group } from "../../joined/_components/joined-group-container";

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

      // handle success
      setIsJoined(true);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const memberCount = group.members.length;
  const displayMembers = group.members.slice(0, 3);
  const remainingMembers = Math.max(0, group.members.length - 3);

  // Format member count for display (e.g., "175K members")
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-lg">
      {/* Cover Image Container */}
      <div className="relative h-40 w-full bg-linear-to-br from-slate-200 to-slate-300">
        {group.coverImage?.url && (
          <Image
            src={group.coverImage.url}
            alt={group.name}
            fill
            className="object-cover"
          />
        )}
        {/* Semi-transparent overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Group Name/Logo Overlay */}
        {/* <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white drop-shadow-lg">
              {group.name}
            </h3>
          </div>
        </div> */}

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 transition-all hover:bg-white"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>
        )}
      </div>

      {/* Content Container */}
      <div className="space-y-4 p-5">
        {/* Stats */}
        <div className="space-y-1">
          <h3 className="font-semibold">{group.name}</h3>
          <p className="text-sm font-medium text-slate-600">
            {formatCount(memberCount)} members • 10+ posts a day
          </p>
          <p className="text-xs text-slate-500">{group.category}</p>
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
                    className="rounded-full border-2 border-white object-cover"
                  />
                </div>
              );
            })}
          </div>
          <p className="text-sm text-slate-700">
            <span className="font-medium">{displayMembers[0]?.firstName}</span>
            {remainingMembers > 0 && (
              <span className="text-slate-600">
                {" "}
                and {remainingMembers} friend{remainingMembers > 1 ? "s" : ""}{" "}
                are members
              </span>
            )}
            {remainingMembers === 0 && displayMembers.length > 1 && (
              <span className="text-slate-600">
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
            className="w-full
    bg-blue-50
    hover:bg-blue-100
    text-blue-600
    transition-colors duration-200"
          >
            Visit Group
          </Button>
        ) : (
          <Button
            onClick={() => mutate()}
            disabled={isPending || isJoined}
            className="w-full bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {isPending && <Loader2 className="animate-spin" />} Join Group
          </Button>
        )}
      </div>
    </div>
  );
}
