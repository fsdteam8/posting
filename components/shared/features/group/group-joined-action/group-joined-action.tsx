"use client";

import { useLeaveGroup } from "@/app/(website)/(features)/groups/(feed)/_components/api/use-leave-group-api";
import { Button } from "@/components/ui/button";
import { Group } from "@/types/features/groups";
import {
  BellOff,
  ChevronDown,
  Loader2,
  LogOut,
  Trash2,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJoinGroup } from "@/hooks/features/groups/api/use-join-group";

interface Props {
  accessToken: string;
  data: Group;
  isAdmin: boolean;
  isJoined: boolean;
  cu?: {
    username: string;
    id: string;
  };
}

const GroupJoinedAction = ({
  accessToken,
  data,
  isAdmin,
  isJoined,
  cu,
}: Props) => {
  const { mutate: leaveGroup, isPending } = useLeaveGroup({
    groupId: data._id,
    accessToken,
    cu,
  });
  const { mutate: joinNow, isPending: isJoining } = useJoinGroup({
    groupId: data._id,
    accessToken,
  });

  const handleLeave = () => {
    leaveGroup(undefined);
  };

  const handleUnfollow = () => {
    // TODO: hook/API for unfollow
    console.log("Unfollow group");
  };

  const handleDelete = () => {
    // TODO: hook/API for delete group
    console.log("Delete group");
  };

  if (!isJoined) {
    return (
      <Button
        variant="secondary"
        className="gap-1.5 px-4 py-1.5 text-[15px] font-semibold"
        size="sm"
        disabled={isJoining}
        onClick={() => joinNow()}
      >
        {isJoining ? (
          <Loader2 className="w-4 h-4" />
        ) : (
          <Users className="w-4 h-4" />
        )}
        Join Group
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="gap-1.5 px-4 py-1.5 text-[15px] font-semibold"
          size="sm"
          disabled={isPending}
        >
          <Users className="w-4 h-4" />
          Joined
          <ChevronDown className="w-3.5 h-3.5 ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleUnfollow}>
          <BellOff className="mr-2 h-4 w-4" />
          Unfollow group
        </DropdownMenuItem>

        {!isAdmin && (
          <DropdownMenuItem onClick={handleLeave} disabled={isPending}>
            <LogOut className="mr-2 h-4 w-4" />
            Leave group
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Group
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GroupJoinedAction;
