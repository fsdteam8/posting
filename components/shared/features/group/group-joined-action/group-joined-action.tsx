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

import AlertModal from "@/components/ui/custom/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteGroup } from "@/hooks/features/groups/api/use-delete-group";
import { useJoinGroup } from "@/hooks/features/groups/api/use-join-group";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";

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
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState<true | false>(false);
  const { mutate: leaveGroup, isPending } = useLeaveGroup({
    groupId: data._id,
    accessToken,
    cu,
  });
  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroup({
    groupId: data._id,
    accessToken,
    cu,
    cb: () => {
      setDeleteOpen(false);
      router.push("/groups");
    },
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
    deleteGroup();
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
    <>
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
              <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Group
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertModal
        onConfirm={handleDelete}
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        loading={isDeleting}
        title="Delete group by leaving?"
        message="Are you sure you want to leave Private Group? Since you're the last member, leaving now will also delete this group."
      />
    </>
  );
};

export default GroupJoinedAction;
