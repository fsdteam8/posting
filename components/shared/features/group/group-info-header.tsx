"use client";

import { Button } from "@/components/ui/button";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { formatCount } from "@/lib/utils";
import { Globe, Plus, Share2 } from "lucide-react";
import Image from "next/image";
import ErrorScreen from "../../screens/error-screen";
import GroupJoinedAction from "./group-joined-action/group-joined-action";

interface Props {
  username: string;
  accessToken: string;
  loggedinUserId: string;
}

export default function GroupInfoHeader({
  username,
  accessToken,
  loggedinUserId,
}: Props) {
  const { data, refetch, isRefetching } = useGetSingleGroup({
    username,
    accessToken,
  });

  let content;
  if (!data?.success) {
    content = (
      <ErrorScreen
        message={data?.message ?? "Something went wrong"}
        onRetry={refetch}
        isRefetching={isRefetching}
      />
    );
  } else if (data && data.success) {
    const group = data.data;
    const memberCount = group.members.length;

    const members = group.members
      .filter((item) => item.profileImage?.url) // ✅ remove empty image users
      .map((item) => ({
        url: item.profileImage!.url,
        firstName: item.firstName,
      }));

    const MyAdminInfo = group.admins.filter(
      (item) => item._id === loggedinUserId,
    );
    const isLoggedinUserAdmin = MyAdminInfo.length > 0;
    const isJoinedInfo = group.members.find(
      (item) => item._id === loggedinUserId,
    )?._id;

    const isJoined = Boolean(isJoinedInfo);

    const whoCanInvite = group.whoCanInvite;
    content = (
      <div className="bg-fb-bg-card px-4 pt-5 pb-3">
        <h1 className="text-2xl sm:text-[28px] font-bold text-fb-text-primary leading-tight">
          {group.name}
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span className="text-[13px]  font-normal">
            {group.privacy} group
          </span>
          <span className="text-[13px] text-fb-text-secondary">{"·"}</span>
          <span className="text-[13px] text-fb-text-secondary font-normal">
            {formatCount(memberCount)} members
          </span>
        </div>

        <div className="flex items-center justify-between">
          {/* Member avatars */}
          <div className="flex items-center mt-3 -space-x-2">
            {members.slice(0, 10).map((member, index) => (
              <div key={index} className="relative group">
                <div className="relative w-8 h-8 rounded-full border-2 border-fb-bg-card overflow-hidden bg-gray-200">
                  {member.url ? (
                    <Image
                      src={member.url}
                      alt={member.firstName}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-white bg-fb-blue">
                      {member.firstName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {member.firstName}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {(isLoggedinUserAdmin ||
              (isJoined && whoCanInvite === "anyone")) && (
              <Button
                className="gap-1.5 px-4 py-1.5 text-[15px] font-semibold"
                variant="default"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Invite
              </Button>
            )}

            <Button
              variant="secondary"
              className="gap-1.5 px-4 py-1.5 text-[15px] font-semibold"
              size="sm"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>

            <GroupJoinedAction
              accessToken={accessToken}
              data={group}
              isAdmin={isLoggedinUserAdmin}
              isJoined={isJoined}
              cu={{ username, id: loggedinUserId }}
            />
          </div>
        </div>
      </div>
    );
  }

  return content;
}
