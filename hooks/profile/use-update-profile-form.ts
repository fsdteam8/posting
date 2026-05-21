import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiResponse = {
  success: boolean;
  message: string;
};

export type ProfileFormPayload = {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  address?: string;
  currentCity?: string;
  hometown?: string;
  relationshipStatus?: string;
  website?: string;
  interests?: string[];
  hobbies?: string[];
  languages?: string[];
  skills?: string[];
  socialLinks?: { platform: string; url: string }[];
  avatar?: File | null;
  cover?: File | null;
};

function buildFormData(payload: ProfileFormPayload): FormData {
  const fd = new FormData();

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  };

  append("firstName", payload.firstName);
  append("lastName", payload.lastName);
  append("username", payload.username);
  append("bio", payload.bio);
  append("dob", payload.dob);
  append("gender", payload.gender);
  append("phone", payload.phone);
  append("address", payload.address);
  append("currentCity", payload.currentCity);
  append("hometown", payload.hometown);
  append("relationshipStatus", payload.relationshipStatus);
  append("website", payload.website);

  const appendArray = (key: string, arr?: string[]) => {
    if (!arr) return;
    if (arr.length === 0) {
      fd.append(key, "");
      return;
    }
    fd.append(key, arr.join(","));
  };

  appendArray("interests", payload.interests);
  appendArray("hobbies", payload.hobbies);
  appendArray("languages", payload.languages);
  appendArray("skills", payload.skills);

  if (payload.socialLinks !== undefined) {
    fd.append("socialLinks", JSON.stringify(payload.socialLinks));
  }

  if (payload.avatar) fd.append("avatar", payload.avatar);
  if (payload.cover) fd.append("cover", payload.cover);

  return fd;
}

export function useUpdateProfileForm({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, ProfileFormPayload>({
    mutationKey: ["update-profile-form"],

    mutationFn: async (payload) => {
      const res = await fetch(`${baseURL}/users/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: buildFormData(payload),
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
        toast.error(res.message ?? "Update failed");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(res.message || "Profile updated");
    },

    onError: (err) => {
      toast.error(err.message ?? "Something went wrong");
    },
  });
}
