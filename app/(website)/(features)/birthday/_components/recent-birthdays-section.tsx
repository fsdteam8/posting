"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentBirthdays } from "@/hooks/features/birthdays/use-birthdays";
import {
  ageLabel,
  formatBirthdayDate,
  sortByMonthDay,
} from "./birthday-helpers";
import { BirthdayMessageRow } from "./birthday-message-row";
import { BirthdayWishRow } from "./birthday-wish-row";

interface Props {
  accessToken: string;
}

export function RecentBirthdaysSection({ accessToken }: Props) {
  const { data, isLoading, isError, error } = useRecentBirthdays({
    accessToken,
    days: 7,
  });
  const list = sortByMonthDay(data?.data ?? []);

  if (isLoading) {
    return (
      <Card className="p-5 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-5">
        <p className="text-sm text-destructive">
          {error?.message ?? "Could not load recent birthdays."}
        </p>
      </Card>
    );
  }

  if (list.length === 0) return null;

  // First recent gets the inline wish input (matches the design),
  // the rest get a compact "Message" CTA.
  const [first, ...rest] = list;

  return (
    <Card className="p-5">
      <h2 className="text-base font-bold text-foreground">Recent birthdays</h2>
      <p className="text-xs text-muted-foreground mt-1 mb-4">
        The best things in life are the people we love and the places
        we&apos;ve been.
      </p>

      <div className="space-y-5">
        <BirthdayMessageRow
          user={first}
          accessToken={accessToken}
          ageLabel={ageLabel(first.dob)}
          dateLabel={formatBirthdayDate(first.dob)}
        />

        {rest.map((u) => (
          <BirthdayWishRow
            key={u._id}
            user={u}
            accessToken={accessToken}
            ageLabel={ageLabel(u.dob)}
            dateLabel={formatBirthdayDate(u.dob)}
          />
        ))}
      </div>
    </Card>
  );
}
