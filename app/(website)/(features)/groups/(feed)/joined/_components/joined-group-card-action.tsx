import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Group } from "@/types/features/groups";
import {
  Loader2,
  MoreHorizontal,
  Pin,
  PinOff,
  SquareArrowRightExit,
} from "lucide-react";
import { useLeaveGroup } from "../../_components/api/use-leave-group-api";
import { usePinGroup } from "../../_components/api/use-pin-group-api";

interface Props {
  data: Group;
  accessToken: string;
}

const JoinedGroupCardAction = ({ data, accessToken }: Props) => {
  const { mutate: leaveGroup, isPending } = useLeaveGroup({
    groupId: data._id,
    accessToken,
  });

  const { mutate: pinGroup, isPending: isPinPending } = usePinGroup({
    groupId: data._id,
    accessToken,
  });

  return (
    <div>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md  text-[#050505] transition-colors ">
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
              <MenubarItem onClick={() => leaveGroup()}>
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <SquareArrowRightExit />
                )}{" "}
                Leave Group
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export default JoinedGroupCardAction;
