import { baseURL } from "@/constants";
import type { Profile } from "@/hooks/profile/use-profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

interface ToggleVars {
  userId: string;
  /** Current follow state (the action will flip it). */
  isFollowing: boolean;
}

interface FollowResponse {
  success: boolean;
  message: string;
  data: { following: boolean; userId: string };
}

interface MutationContext {
  previousProfile: Profile | undefined;
}

/**
 * Single toggle hook that calls POST or DELETE on /users/follow/:userId
 * based on the current follow state, then patches the cached profile's
 * `following` array so every consumer reacts instantly.
 *
 * Includes optimistic update with rollback on error.
 */
export function useToggleFollowUser({ accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation<FollowResponse, Error, ToggleVars, MutationContext>({
    mutationKey: ["toggle-follow-user"],

    mutationFn: async ({ userId, isFollowing }) => {
      const res = await fetch(`${baseURL}/users/follow/${userId}`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
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

    onMutate: async ({ userId, isFollowing }) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });

      const previousProfile = queryClient.getQueryData<Profile>(["profile"]);

      queryClient.setQueryData<Profile>(["profile"], (old) => {
        if (!old) return old;
        const next = isFollowing
          ? old.following.filter((id) => id !== userId)
          : [...(old.following ?? []), userId];
        return { ...old, following: next };
      });

      return { previousProfile };
    },

    onError: (err, _vars, ctx) => {
      if (ctx?.previousProfile) {
        queryClient.setQueryData(["profile"], ctx.previousProfile);
      }
      toast.error(err.message || "Failed to update follow state");
    },

    onSuccess: (res, { userId }) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      // Reconcile cache with server truth in case of race conditions.
      queryClient.setQueryData<Profile>(["profile"], (old) => {
        if (!old) return old;
        const has = old.following?.includes(userId);
        if (res.data.following && !has) {
          return { ...old, following: [...(old.following ?? []), userId] };
        }
        if (!res.data.following && has) {
          return {
            ...old,
            following: old.following.filter((id) => id !== userId),
          };
        }
        return old;
      });

      // Other surfaces that show this user (public profile, suggestions)
      // can re-derive their follow state on next fetch.
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      queryClient.invalidateQueries({ queryKey: ["follow-suggestions"] });
    },
  });
}
