"use client";

import { Button } from "@/components/ui/button";
import { useGetMyGroup } from "@/hooks/features/groups/api/use-get-my-group"; // adjust path
import { Loader2 } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";

interface Props {
  accessToken: string;
}

const GroupsIManageSidebar = ({ accessToken }: Props) => {
  const router = useRouter();
  const { data, isLoading, isError, error } = useGetMyGroup({
    accessToken,
    limit: 4, // ✅ fetch only 4
  });

  const groups = data?.pages.flatMap((p) => p.data).slice(0, 4) ?? [];

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
          Groups you manage
        </h3>
        <Button variant="link" onClick={() => router.push(`/groups/manage`)}>
          See all
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground px-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Loading...</span>
        </div>
      )}

      {isError && (
        <p className="text-xs text-red-500 px-2 py-2">
          {error?.message ?? "Failed to load groups"}
        </p>
      )}

      {!isLoading && !isError && groups.length === 0 && (
        <p className="text-xs text-muted-foreground px-2 py-2">
          You don’t manage any groups yet.
        </p>
      )}

      <div className="space-y-2">
        {groups.map((g) => {
          const initials = g.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join("");

          const lastActive = g.currentUserMeta?.lastVisitedAt
            ? moment(g.currentUserMeta.lastVisitedAt).fromNow()
            : null;

          return (
            <div
              key={g._id}
              className="px-4 py-3 rounded-lg flex items-center gap-3 text-foreground hover:bg-muted transition-colors cursor-pointer"
              onClick={() => router.push(`/groups/${g.groupUserName}`)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                {g?.coverImage?.url ? (
                  <Image
                    src={g.coverImage.url}
                    alt={g.name}
                    className="w-full h-full object-cover"
                    height={40}
                    width={40}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {initials || "G"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{g.name}</div>

                <div className="text-xs text-muted-foreground">
                  {lastActive ? `Last active ${lastActive}` : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default GroupsIManageSidebar;
