import { baseURL } from "@/constants";
import { ApiRes, Page } from "@/types/features/pages";
import { useQuery } from "@tanstack/react-query";

export function useGetMyPages({ accessToken }: { accessToken: string }) {
  return useQuery<ApiRes<Page[]>, Error>({
    queryKey: ["my-pages"],

    queryFn: async () => {
      const res = await fetch(`${baseURL}/pages/my-pages`, {
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
