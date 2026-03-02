import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;

  const visible = name.slice(0, 2);
  const masked = "*".repeat(Math.max(name.length - 2, 0));

  return `${visible}${masked}@${domain}`;
};

export const maskPhone = (phone: string) => {
  if (!phone) return phone;

  // Remove non-digit characters (optional, but safer)
  const digits = phone.replace(/\D/g, "");

  if (digits.length <= 4) return phone;

  const start = digits.slice(0, 2);
  const end = digits.slice(-2);
  const masked = "*".repeat(digits.length - 4);

  return `${start}${masked}${end}`;
};

// Format member count for display (e.g., "175K members")
export const formatCount = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
};
