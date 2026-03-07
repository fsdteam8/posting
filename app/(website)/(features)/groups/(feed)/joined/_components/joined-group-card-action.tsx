import AlertModal from "@/components/ui/custom/alert-modal";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useDeleteGroup } from "@/hooks/features/groups/api/use-delete-group";
import { Group } from "@/types/features/groups";
import {
  Loader2,
  MoreHorizontal,
  Pin,
  PinOff,
  SquareArrowRightExit,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { useLeaveGroup } from "../../_components/api/use-leave-group-api";
import { usePinGroup } from "../../_components/api/use-pin-group-api";

interface Props {
  data: Group;
  accessToken: string;
  isAdmin?: boolean;
}

const JoinedGroupCardAction = ({ data, accessToken, isAdmin }: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroup({
    groupId: data._id,
    accessToken,
    cb: () => {
      setDeleteOpen(false);
    },
  });
  const { mutate: leaveGroup, isPending } = useLeaveGroup({
    groupId: data._id,
    accessToken,
  });

  const { mutate: pinGroup, isPending: isPinPending } = usePinGroup({
    groupId: data._id,
    accessToken,
  });

  const handleDelete = () => {
    deleteGroup();
  };

  return (
    <div>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem
                onClick={() => pinGroup(!data.currentUserMeta.isPinned)}
                disabled={isPinPending}
              >
                {isPinPending ? (
                  <Loader2 className="animate-spin" />
                ) : data.currentUserMeta.isPinned ? (
                  <PinOff />
                ) : (
                  <Pin />
                )}{" "}
                {data.currentUserMeta.isPinned ? "Unpin" : "Pin"} Group
              </MenubarItem>
              <MenubarSeparator />
              {!isAdmin && (
                <MenubarItem onClick={() => leaveGroup()}>
                  {isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <SquareArrowRightExit />
                  )}{" "}
                  Leave Group
                </MenubarItem>
              )}
              <MenubarItem onClick={() => setDeleteOpen(true)}>
                {isPending ? <Loader2 className="animate-spin" /> : <Trash />}{" "}
                Delete Group
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <AlertModal
        onConfirm={handleDelete}
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        loading={isDeleting}
        title="Delete group by leaving?"
        message="Are you sure you want to leave Private Group? Since you're the last member, leaving now will also delete this group."
      />
    </div>
  );
};

export default JoinedGroupCardAction;
