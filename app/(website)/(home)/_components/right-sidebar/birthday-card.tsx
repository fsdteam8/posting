"use client";

import { useBirthdaySummary } from "@/hooks/features/birthdays/use-birthdays";
import { Gift } from "lucide-react";
import Link from "next/link";

interface Props {
  accessToken: string;
}

export function BirthdaysCard({ accessToken }: Props) {
  const { data, isLoading } = useBirthdaySummary({ accessToken });

  const total = data?.data?.total ?? 0;
  const preview = data?.data?.preview ?? [];

  return (
    <Link
      href="/birthday"
      className="flex flex-col gap-3 group"
      aria-label="Open birthdays"
    >
      <h3 className="text-[17px] font-semibold text-foreground">
        Celebrations Today
      </h3>

      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-500">
          <Gift className="size-5" />
        </span>

        {isLoading ? (
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Checking today&apos;s celebrations…
          </p>
        ) : total === 0 ? (
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            No friends have a birthday today.
          </p>
        ) : (
          <p className="text-[14px] leading-relaxed text-foreground">
            {preview.map((u, i) => (
              <span key={u._id}>
                <span className="font-semibold group-hover:underline">
                  {u.firstName}
                </span>
                {i < preview.length - 1 ? ", " : ""}
              </span>
            ))}
            {total > preview.length && (
              <>
                {" "}
                and{" "}
                <span className="font-semibold text-primary group-hover:underline">
                  {total - preview.length} other
                  {total - preview.length === 1 ? "" : "s"}
                </span>
              </>
            )}{" "}
            <span className="text-muted-foreground">
              {total === 1 ? "has" : "have"} Birthday Today
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
