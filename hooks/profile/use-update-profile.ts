import { baseURL } from "@/constants";
import {
  Education,
  Profile,
  SocialUrl,
  Work,
} from "@/hooks/profile/use-profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiResponse = {
  success: boolean;
  message: string;
};

type UpdateProfilePayload = Partial<
  Pick<
    Profile,
    | "bio"
    | "firstName"
    | "lastName"
    | "phone"
    | "address"
    | "username"
    | "dob"
    | "gender"
    | "website"
    | "currentCity"
    | "hometown"
    | "relationshipStatus"
    | "interests"
    | "hobbies"
    | "languages"
    | "skills"
    | "isOnboarded"
  >
> & {
  education?: Education[];
  socialLinks?: SocialUrl[];
  works?: Work[];
};

export function useUpdateProfile({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, UpdateProfilePayload>({
    mutationKey: ["update-profile"],

    mutationFn: async (payload) => {
      const res = await fetch(`${baseURL}/users/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
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
