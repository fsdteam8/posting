"use client";

import { baseURL } from "@/constants";
import type {
  BirthdayListApiRes,
  BirthdaySummaryApiRes,
} from "@/types/features/birthdays";
import { useQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
}

const buildFetcher =
  (path: string, accessToken: string) => async (): Promise<BirthdayListApiRes> => {
    const res = await fetch(`${baseURL}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      let msg = `Request failed (${res.status})`;
      try {
        const body = await res.json();
        msg = body?.message ?? msg;
      } catch {}
      throw new Error(msg);
    }
    return res.json();
  };

export function useTodaysBirthdays({ accessToken }: Params) {
  return useQuery<BirthdayListApiRes, Error>({
    queryKey: ["birthdays", "today"],
    queryFn: buildFetcher("/birthdays/today", accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentBirthdays({
  accessToken,
  days = 7,
}: Params & { days?: number }) {
  return useQuery<BirthdayListApiRes, Error>({
    queryKey: ["birthdays", "recent", days],
    queryFn: buildFetcher(`/birthdays/recent?days=${days}`, accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpcomingBirthdays({
  accessToken,
  days = 30,
}: Params & { days?: number }) {
  return useQuery<BirthdayListApiRes, Error>({
    queryKey: ["birthdays", "upcoming", days],
    queryFn: buildFetcher(`/birthdays/upcoming?days=${days}`, accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBirthdaysByMonth({
  accessToken,
  month,
}: Params & { month: number }) {
  return useQuery<BirthdayListApiRes, Error>({
    queryKey: ["birthdays", "by-month", month],
    queryFn: buildFetcher(`/birthdays/by-month?month=${month}`, accessToken),
    enabled: !!accessToken && Number.isInteger(month) && month >= 1 && month <= 12,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBirthdaySummary({ accessToken }: Params) {
  return useQuery<BirthdaySummaryApiRes, Error>({
    queryKey: ["birthdays", "summary"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/birthdays/summary`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
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
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });
}
