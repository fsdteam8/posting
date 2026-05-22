import type { BirthdayFriend } from "@/types/features/birthdays";

export function ageOnNextBirthday(dob: string | Date): number | null {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  // If their birthday hasn't happened yet this year, they're still the
  // previous age — but for a "today/upcoming birthday" UI, the age they
  // are turning is what people expect, so increment if not yet reached.
  const beforeBirthdayThisYear =
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeBirthdayThisYear) age += 0; // they're turning this number on their next birthday
  return age;
}

export function ageLabel(dob: string | Date): string | null {
  const a = ageOnNextBirthday(dob);
  if (a == null || a < 0 || a > 150) return null;
  return `${a} years old`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTH_NAMES = MONTHS;

export function formatBirthdayDate(dob: string | Date): string {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}, ${d.getFullYear()}`;
}

export function currentMonthIndex(): number {
  return new Date().getMonth();
}

export function sortByMonthDay(list: BirthdayFriend[]): BirthdayFriend[] {
  return [...list].sort((a, b) => {
    const da = new Date(a.dob);
    const db = new Date(b.dob);
    const ma = da.getMonth();
    const mb = db.getMonth();
    if (ma !== mb) return ma - mb;
    return da.getDate() - db.getDate();
  });
}
