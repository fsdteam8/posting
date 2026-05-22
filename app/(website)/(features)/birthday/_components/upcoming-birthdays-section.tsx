"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingBirthdays } from "@/hooks/features/birthdays/use-birthdays";
import {
  formatBirthdayDate,
  sortByMonthDay,
} from "./birthday-helpers";
import { BirthdayMessageRow } from "./birthday-message-row";

interface Props {
  accessToken: string;
}

export function UpcomingBirthdaysSection({ accessToken }: Props) {
  const { data, isLoading, isError, error } = useUpcomingBirthdays({
    accessToken,
    days: 30,
  });
  const list = sortByMonthDay(data?.data ?? []);

  if (isLoading) {
    return (
      <Card className="p-5 space-y-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-5">
        <p className="text-sm text-destructive">
          {error?.message ?? "Could not load upcoming birthdays."}
        </p>
      </Card>
    );
  }

  if (list.length === 0) return null;

  return (
    <Card className="p-5">
      <h2 className="text-base font-bold text-foreground mb-4">
        Upcoming birthdays
      </h2>
      <div className="space-y-4">
        {list.map((u) => (
          <BirthdayMessageRow
            key={u._id}
            user={u}
            accessToken={accessToken}
            dateLabel={formatBirthdayDate(u.dob)}
          />
        ))}
      </div>
    </Card>
  );
}
