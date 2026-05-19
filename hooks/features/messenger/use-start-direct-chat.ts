"use client";

import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

/**
 * Opens (or creates) a direct conversation with the given user and navigates
 * the browser to `/messenger/<id>`. Use this from any "Message" button across
 * the app (friends, marketplace, profile, etc.).
 */
export function useStartDirectChat({ accessToken }: Params) {
  const router = useRouter();

  const mutation = useMutation<{ data: { _id: string } }, Error, { userId: string }>({
    mutationKey: ["messenger", "start-direct"],
    mutationFn: async ({ userId }) => {
      const res = await fetch(`${baseURL}/messages/conversations/direct`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          msg = body?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    onError: (err) => toast.error(err.message),
  });

  const startChat = useCallback(
    async (userId: string) => {
      try {
        const res = await mutation.mutateAsync({ userId });
        if (res?.data?._id) router.push(`/messenger/${res.data._id}`);
      } catch {
        /* toast already shown */
      }
    },
    [mutation, router],
  );

  return { startChat, isStarting: mutation.isPending };
}
