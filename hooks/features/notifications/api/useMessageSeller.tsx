import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageSellerResponse = {
  success: boolean;
  message: string;
  data: {
    conversationId: string;
    listingId: string;
    message: {
      _id: string;
      conversation: string;
      sender: string;
      type: string;
      text: string;
    };
  };
};

type MessageSellerVariables = {
  listingId: string;
  message: string;
};

/**
 * Sends a message to the seller of a listing.
 *
 * The API either creates a new conversation or returns the existing one,
 * so this is safe to call multiple times — it won't create duplicate threads.
 *
 * After success the caller should navigate to the conversation using
 * res.data.conversationId:
 *
 *   onSuccess: (res) => router.push(`/messages/${res.data.conversationId}`)
 *
 * No React Query cache to invalidate here — conversations live under a
 * separate messages feature with its own query keys.
 */
export function useMessageSeller({ accessToken }: { accessToken: string }) {
  return useMutation<MessageSellerResponse, Error, MessageSellerVariables>({
    mutationKey: ["marketplace", "message-seller"],

    mutationFn: async ({ listingId, message }) => {
      const res = await fetch(
        `${baseURL}/marketplace/listings/${listingId}/message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
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

    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
      }
      // Navigation to the conversation is handled by the component,
      // not the hook, since the hook doesn't own routing.
    },

    onError: (err) => {
      toast.error(err.message || "Failed to send message");
    },
  });
}
