import { baseURL } from "@/constants";
import type {
  Message,
  MessageType,
  MessengerUser,
  MessagesResponse,
  SendMessageResponse,
} from "@/types/messenger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

interface Body {
  conversationId: string;
  text?: string;
  replyTo?: string | null;
  file?: File | null;
  optimisticSender?: MessengerUser;
}

interface MutationContext {
  previousMessages: [readonly unknown[], MessagesResponse | undefined][];
  tempMessageId?: string;
}

function getMessageType(file?: File | null): MessageType {
  if (!file) return "text";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

function createOptimisticMessage({
  conversationId,
  text,
  file,
  optimisticSender,
}: Body): Message | null {
  if (!optimisticSender) return null;
  if (!text?.trim() && !file) return null;

  const type = getMessageType(file);
  const now = new Date().toISOString();
  const previewUrl =
    file && typeof URL !== "undefined" ? URL.createObjectURL(file) : "";

  return {
    _id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    conversation: conversationId,
    sender: optimisticSender,
    type,
    text: text ?? "",
    media: file
      ? {
          url: previewUrl,
          public_id: "",
          mimeType: file.type,
          fileName: file.name,
          size: file.size,
        }
      : undefined,
    seenBy: [optimisticSender._id],
    reactions: [],
    deletedFor: [],
    isDeleted: false,
    sendStatus: "waiting",
    createdAt: now,
    updatedAt: now,
  };
}

export function useSendMessage({ accessToken }: Params) {
  const qc = useQueryClient();

  return useMutation<SendMessageResponse, Error, Body, MutationContext>({
    mutationKey: ["messenger", "send"],
    onMutate: async (vars) => {
      await qc.cancelQueries({
        queryKey: ["messenger", "messages", vars.conversationId],
      });

      const previousMessages = qc.getQueriesData<MessagesResponse>({
        queryKey: ["messenger", "messages", vars.conversationId],
      });
      const optimisticMessage = createOptimisticMessage(vars);

      if (optimisticMessage) {
        qc.setQueriesData<MessagesResponse>(
          { queryKey: ["messenger", "messages", vars.conversationId] },
          (old) => {
            if (!old) return old;
            if (old.data.some((m) => m._id === optimisticMessage._id)) {
              return old;
            }
            return { ...old, data: [...old.data, optimisticMessage] };
          },
        );
      }

      return {
        previousMessages,
        tempMessageId: optimisticMessage?._id,
      };
    },
    mutationFn: async ({ conversationId, text, replyTo, file }) => {
      const fd = new FormData();
      if (text) fd.append("text", text);
      if (replyTo) fd.append("replyTo", replyTo);
      if (file) fd.append("file", file);

      const res = await fetch(
        `${baseURL}/messages/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: fd,
        },
      );
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
    onSuccess: (res, vars, context) => {
      if (!res.success) {
        toast.error(res.message);
        if (context?.tempMessageId) {
          qc.setQueriesData<MessagesResponse>(
            { queryKey: ["messenger", "messages", vars.conversationId] },
            (old) =>
              old
                ? {
                    ...old,
                    data: old.data.map((message) =>
                      message._id === context.tempMessageId
                        ? { ...message, sendStatus: "failed" }
                        : message,
                    ),
                  }
                : old,
          );
        }
        return;
      }
      if (context?.tempMessageId) {
        qc.setQueriesData<MessagesResponse>(
          { queryKey: ["messenger", "messages", vars.conversationId] },
          (old) =>
            old
              ? {
                  ...old,
                  data: old.data.flatMap((message) => {
                    if (message._id === context.tempMessageId) {
                      return [{ ...res.data.message, sendStatus: "sent" }];
                    }
                    if (message._id === res.data.message._id) {
                      return [];
                    }
                    return [message];
                  }),
                }
              : old,
        );
      }
      qc.invalidateQueries({
        queryKey: ["messenger", "messages", vars.conversationId],
      });
      qc.invalidateQueries({ queryKey: ["messenger", "conversations"] });
    },
    onError: (err, vars, context) => {
      if (context?.tempMessageId) {
        qc.setQueriesData<MessagesResponse>(
          { queryKey: ["messenger", "messages", vars.conversationId] },
          (old) =>
            old
              ? {
                  ...old,
                  data: old.data.map((message) =>
                    message._id === context.tempMessageId
                      ? { ...message, sendStatus: "failed" }
                      : message,
                  ),
                }
              : old,
        );
      } else {
        context?.previousMessages.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message);
    },
  });
}
