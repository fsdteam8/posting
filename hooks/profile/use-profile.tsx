import { baseURL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

interface Profile {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage: { url: string };
  email: string;
}

export function useProfile(accessToken: string) {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: () =>
      fetch(`${baseURL}/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then((res) => res.data),
  });
}
