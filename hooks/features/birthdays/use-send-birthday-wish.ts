"use client";

import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

interface SendWishArgs {
  userId: string;
  text: string;
}

type DirectRes = { success: boolean; message: string; data: { _id: string } };

export function useSendBirthdayWish({ accessToken }: Params) {
  const mutation = useMutation<{ ok: true }, Error, SendWishArgs>({
    mutationKey: ["birthdays", "send-wish"],
    mutationFn: async ({ userId, text }) => {
      // 1. Create-or-get the direct conversation
      const convRes = await fetch(`${baseURL}/messages/conversations/direct`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (!convRes.ok) {
        let msg = `Request failed (${convRes.status})`;
        try {
          const body = await convRes.json();
          msg = body?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      const conv: DirectRes = await convRes.json();
      const conversationId = conv?.data?._id;
      if (!conversationId) throw new Error("Could not open conversation");

      // 2. Send the wish text as a regular message (FormData per send-message API)
      const fd = new FormData();
      fd.append("text", text);

      const sendRes = await fetch(
        `${baseURL}/messages/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: fd,
        },
      );
      if (!sendRes.ok) {
        let msg = `Request failed (${sendRes.status})`;
        try {
          const body = await sendRes.json();
          msg = body?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      return { ok: true };
    },
    onError: (err) => toast.error(err.message),
  });

  const sendWish = useCallback(
    async (args: SendWishArgs) => {
      const ok = await mutation
        .mutateAsync(args)
        .then(() => true)
        .catch(() => false);
      if (ok) toast.success("Birthday wish sent!");
      return ok;
    },
    [mutation],
  );

  return { sendWish, isSending: mutation.isPending };
}
