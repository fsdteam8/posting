import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MoreHorizontal,
  Pin,
  SquareArrowRightExit,
} from "lucide-react";
import { toast } from "sonner";
import { Group, GroupsResponse } from "./joined-group-container";

interface Props {
  data: Group;
  accessToken: string;
}

const JoinedGroupCardAction = ({ data, accessToken }: Props) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["leave-group", data._id],
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/groups/${data._id}/leave`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // optional: treat non-2xx as error
      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          message = body?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return res.json() as Promise<ApiRes>;
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      // ✅ remove from "joined-group" cache
      queryClient.setQueryData<GroupsResponse>(
        ["joined-group", accessToken],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((g) => g._id !== data._id),
          };
        },
      );

      toast.success("Left group");
    },
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
              <MenubarItem>
                <Pin /> Pin Group
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => mutate()}>
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

interface ApiRes {
  success: boolean;
  message: string;
}
