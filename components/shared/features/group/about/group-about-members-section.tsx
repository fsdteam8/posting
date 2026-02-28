"use client";

import ErrorScreen from "@/components/shared/screens/error-screen";
import { Button } from "@/components/ui/button";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { formatCount } from "@/lib/utils";
import { GroupUser } from "@/types/features/groups";
import { useRouter } from "nextjs-toploader/app";

interface GroupMembersSectionProps {
  username: string;
  accessToken: string;
}

// const formatMemberCount = (count: number): string => {
//   if (count >= 1_000_000)
//     return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
//   if (count >= 1_000)
//     return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
//   return String(count);
// };

const getInitials = (text: string): string => {
  return text
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getFirstNames = (users: GroupUser[], n: number) =>
  users.slice(0, n).map((u) => u.firstName);

export default function GroupAboutMemberSection({
  username,
  accessToken,
}: GroupMembersSectionProps) {
  const router = useRouter();
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetSingleGroup({ username, accessToken });

  if (isLoading) return null;

  if (isError) {
    return (
      <ErrorScreen
        message={(error as Error)?.message ?? "Something went wrong"}
        isRefetching={isRefetching}
        onRetry={refetch}
      />
    );
  }

  if (!data?.success) return null;

  const group = data.data;
  const members: GroupUser[] = group.members ?? [];
  const admins: GroupUser[] = group.admins ?? [];

  const totalMembers = members.length;
  const adminsCount = admins.length;

  const displayMembers = members.slice(0, 12);
  const displayAdmins = admins.slice(0, 10);

  // Descriptions (handles 0/1/2+ cleanly)
  const memberNames = getFirstNames(displayMembers, 2);
  const remainingMembers = Math.max(0, totalMembers - memberNames.length);

  const membersText =
    memberNames.length === 0
      ? "No members yet."
      : memberNames.length === 1
        ? `${memberNames[0]} has joined`
        : `${memberNames[0]} and ${memberNames[1]} have joined`;

  const membersSuffix =
    remainingMembers > 0
      ? ` and ${remainingMembers} other ${remainingMembers === 1 ? "member" : "members"}`
      : "";

  const adminNames = getFirstNames(displayAdmins, 2);
  const remainingAdmins = Math.max(0, adminsCount - adminNames.length);

  const adminsText =
    adminNames.length === 0
      ? ""
      : adminNames.length === 1
        ? `${adminNames[0]} is an admin`
        : `${adminNames[0]} and ${adminNames[1]} are admins`;

  const adminsSuffix =
    remainingAdmins > 0
      ? ` and ${remainingAdmins} other ${remainingAdmins === 1 ? "admin" : "admins"}`
      : "";

  return (
    <div className="w-full rounded-xl border border-border/50 bg-background p-4 max-w-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/40">
        <h2 className="text-sm font-semibold text-foreground">
          Members{" "}
          <span className="text-muted-foreground font-normal">
            · {formatCount(totalMembers)}
          </span>
        </h2>
      </div>

      {/* Members */}
      {displayMembers.length > 0 ? (
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-0 mb-2">
            {displayMembers
              .filter((item) => Boolean(item.profileImage.url))
              .map((member) => {
                const img = member.profileImage?.url || member.profileImage.url;
                return (
                  <div
                    key={member._id}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border/60 overflow-hidden"
                    title={member.username}
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={member.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[11px] font-semibold text-foreground/80">
                        {getInitials(member.username)}
                      </span>
                    )}
                  </div>
                );
              })}

            {totalMembers > displayMembers.length && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border/60 text-[11px] font-semibold text-foreground/80">
                +{totalMembers - displayMembers.length}
              </div>
            )}
          </div>

          <p className="text-[13px] text-muted-foreground leading-snug">
            <span className="font-medium text-foreground">{membersText}</span>
            {remainingMembers > 0 && (
              <>
                <span className="font-medium text-foreground">
                  {membersSuffix}
                </span>{" "}
                have joined
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground mb-4">
          No members yet.
        </p>
      )}

      {/* Admins */}
      {displayAdmins.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {displayAdmins.map((admin) => {
              const img = admin.profileImage?.url || admin.profileImage.url;
              return (
                <div
                  key={admin._id}
                  className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border/60 overflow-hidden"
                  title={admin.username}
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={admin.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-semibold text-foreground/80">
                      {getInitials(admin.username)}
                    </span>
                  )}
                </div>
              );
            })}

            {adminsCount > displayAdmins.length && (
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border/60 text-[10px] font-semibold text-foreground/80">
                +{adminsCount - displayAdmins.length}
              </div>
            )}
          </div>

          <p className="text-[13px] text-muted-foreground leading-snug">
            <span className="font-medium text-foreground">{adminsText}</span>
            {remainingAdmins > 0 && (
              <>
                <span className="font-medium text-foreground">
                  {adminsSuffix}
                </span>
              </>
            )}
            {adminsText ? "." : ""}
          </p>
        </div>
      )}

      {/* See all */}
      <Button
        type="button"
        onClick={() =>
          router.replace(`/groups/view/${group.groupUserName}/members`)
        }
        variant="secondary"
        className="w-full hover:bg-primary/10"
      >
        See all
      </Button>
    </div>
  );
}
