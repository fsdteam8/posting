import { baseURL } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export type Suggestion = {
  type: "user" | "group" | "event";
  _id: string;
  label: string;
  sublabel?: string;
  image?: string | null;
  isOnline?: boolean;
  href: string;
};

export type SuggestionsApiRes = {
  success: boolean;
  message: string;
  data: { suggestions: Suggestion[]; query?: string };
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

type UseSearchSuggestionsParams = {
  query: string;
  limit?: number;
  accessToken?: string;
  enabled?: boolean;
};

export function useSearchSuggestions({
  query,
  limit = 6,
  accessToken,
  enabled = true,
}: UseSearchSuggestionsParams) {
  const debouncedQuery = useDebouncedValue(query.trim(), 220);

  const result = useQuery<SuggestionsApiRes, Error>({
    queryKey: ["search-suggestions", debouncedQuery, limit],

    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        limit: String(limit),
      });

      const res = await fetch(
        `${baseURL}/search/suggest?${params.toString()}`,
        {
          method: "GET",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            "Content-Type": "application/json",
          },
        },
      );

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

    enabled: enabled && debouncedQuery.length >= 1 && !!accessToken,
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });

  return { ...result, debouncedQuery };
}
