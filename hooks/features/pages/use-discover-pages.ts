import { baseURL } from "@/constants";
import { ApiRes, Page } from "@/types/features/pages";
import { useQuery } from "@tanstack/react-query";

export function useDiscoverPages({ accessToken }: { accessToken: string }) {
  return useQuery<ApiRes<Page[]>, Error>({
    queryKey: ["discover-pages"],

    queryFn: async () => {
      const res = await fetch(`${baseURL}/pages/discover`, {
        method: "GET",
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

    enabled: Boolean(accessToken),
  });
}
