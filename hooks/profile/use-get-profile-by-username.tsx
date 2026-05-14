import { baseURL } from "@/constants";
import { Profile } from "@/hooks/profile/use-profile";
import { useQuery } from "@tanstack/react-query";

interface Params {
  username: string;
  accessToken: string;
}

export function useGetProfileByUsername({ username, accessToken }: Params) {
  return useQuery<Profile>({
    queryKey: ["profile", "username", username],
    queryFn: () =>
      fetch(`${baseURL}/users/${username}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then((res) => res.data),
    enabled: Boolean(username) && Boolean(accessToken),
  });
}
