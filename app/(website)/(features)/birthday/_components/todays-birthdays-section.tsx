"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodaysBirthdays } from "@/hooks/features/birthdays/use-birthdays";
import { Cake } from "lucide-react";
import { ageLabel } from "./birthday-helpers";
import { BirthdayWishRow } from "./birthday-wish-row";

interface Props {
  accessToken: string;
}

export function TodaysBirthdaysSection({ accessToken }: Props) {
  const { data, isLoading, isError, error } = useTodaysBirthdays({
    accessToken,
  });
  const list = data?.data ?? [];

  return (
    <Card className="p-5">
      <h2 className="text-base font-bold text-foreground mb-4">
        Today&apos;s birthdays
      </h2>

      {isLoading ? (
        <SkeletonRow />
      ) : isError ? (
        <p className="text-sm text-destructive">
          {error?.message ?? "Could not load birthdays."}
        </p>
      ) : list.length === 0 ? (
        <div className="flex items-center gap-3 py-4 text-muted-foreground">
          <span className="flex size-10 items-center justify-center rounded-lg bg-pink-100 text-pink-500">
            <Cake className="size-5" />
          </span>
          <p className="text-sm">No friends have a birthday today.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((u) => (
            <BirthdayWishRow
              key={u._id}
              user={u}
              accessToken={accessToken}
              ageLabel={ageLabel(u.dob)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="size-14 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
