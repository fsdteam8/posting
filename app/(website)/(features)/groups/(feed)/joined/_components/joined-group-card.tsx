import { Group } from "@/types/features/groups";
import { Pin } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

const JoinedGroupCardAction = dynamic(
  () => import("./joined-group-card-action"),
  { ssr: false },
);

interface JoinedGroupCardProps {
  data: Group;
  accessToken: string;
  onViewClick: () => void;
  isAdmin?: boolean;
}

export default function JoinedGroupCard({
  data,
  accessToken,
  onViewClick,
  isAdmin,
}: JoinedGroupCardProps) {
  const { name: groupName, coverImage, currentUserMeta } = data;

  const groupImage =
    coverImage?.url ??
    "https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg";

  return (
    <div className="relative w-full max-w-101 rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
      {/* Pin icon (top-right) */}
      {currentUserMeta?.isPinned && (
        <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card shadow-sm">
          <Pin className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* Top section */}
      <div className="flex items-center gap-3 p-3 pb-2.5">
        <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={groupImage}
            alt={groupName}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold leading-5 text-foreground">
            {groupName}
          </span>
          <span className="mt-0.5 text-[13px] leading-4 text-muted-foreground">
            5 weeks ago
          </span>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        <button
          onClick={onViewClick}
          className="flex h-9 flex-1 items-center justify-center rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-[15px] font-semibold text-blue-600 dark:text-blue-400 transition-colors"
          type="button"
        >
          View group
        </button>

        <JoinedGroupCardAction
          data={data}
          accessToken={accessToken}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
