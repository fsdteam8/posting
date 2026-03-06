import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // or your toast lib

type ApiRes = {
  success: boolean;
  message: string;
};

type UseDeleteGroupArgs = {
  groupId: string;
  accessToken: string;
  cu?: {
    username: string;
    id: string;
  };
  cb?: () => void;
};

export function useDeleteGroup({
  groupId,
  accessToken,
  cu,
  cb,
}: UseDeleteGroupArgs) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error>({
    mutationKey: ["delete-group", groupId],
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          message = body?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return res.json();
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      // remove from "joined-group" cache

      queryClient.setQueryData(
        ["joined-group", accessToken],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pages: oldData.pages.map((page: any) => ({
              ...page,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: page.data.filter((g: any) => g._id !== groupId),
            })),
          };
        },
      );

      // ✅ on the future just remove loggedInUserFrom member
      if (cu) {
        queryClient.invalidateQueries({ queryKey: ["group", cu.username] });
      }

      // remove from /groups/manage
      queryClient.setQueryData(
        ["my-admin-groups", accessToken],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pages: oldData.pages.map((page: any) => ({
              ...page,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: page.data.filter((g: any) => g._id !== groupId),
            })),
          };
        },
      );

      toast.success("Group Deleted");
      cb?.();
    },
  });
}
