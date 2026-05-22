"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBirthdaysByMonth } from "@/hooks/features/birthdays/use-birthdays";
import Link from "next/link";
import { MONTH_NAMES, sortByMonthDay } from "./birthday-helpers";

interface Props {
  accessToken: string;
  /** 0-11 — defaults to the next calendar month from today. */
  monthIndex: number;
}

export function MonthBirthdaysSection({ accessToken, monthIndex }: Props) {
  const { data, isLoading } = useBirthdaysByMonth({
    accessToken,
    month: monthIndex + 1,
  });
  const list = sortByMonthDay(data?.data ?? []);

  if (isLoading) {
    return (
      <Card className="p-5 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="size-10 rounded-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (list.length === 0) return null;

  const names = list.slice(0, 2).map((u) => `${u.firstName} ${u.lastName}`);
  const remaining = Math.max(list.length - 2, 0);
  const headline =
    list.length === 1
      ? names[0]
      : remaining > 0
        ? `${names.join(", ")} and ${remaining} others`
        : names.join(" and ");

  return (
    <Card className="p-5">
      <h2 className="text-base font-bold text-foreground">
        {MONTH_NAMES[monthIndex]}
      </h2>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{headline}</p>

      <div className="flex flex-wrap gap-2">
        {list.map((u) => {
          const fullName = `${u.firstName} ${u.lastName}`;
          const initials =
            `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();
          const hasAvatar = !!u.profileImage?.url;
          return (
            <Link
              key={u._id}
              href={`/profile/${u.username}`}
              title={fullName}
              className="block"
            >
              <Avatar className="size-10 hover:ring-2 hover:ring-primary/30 transition-shadow">
                {hasAvatar && (
                  <AvatarImage
                    src={u.profileImage.url}
                    alt={fullName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
