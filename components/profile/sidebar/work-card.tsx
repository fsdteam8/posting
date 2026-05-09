"use client";

import { Profile } from "@/hooks/profile/use-profile";
import { Briefcase, Pencil } from "lucide-react";

interface WorkEntry {
  company: string;
  role?: string;
  from?: string;
  to?: string;
  current?: boolean;
}

interface WorkCardProps {
  profile: Profile;
  isOwner: boolean;
}

function formatWorkDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDuration(from?: string, to?: string, current?: boolean) {
  if (!from) return "";
  const start = new Date(from);
  const end = current ? new Date() : to ? new Date(to) : null;
  if (!end) return formatWorkDate(from);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  let dur = "";
  if (years > 0) dur += `${years} Year${years > 1 ? "s" : ""}`;
  if (remMonths > 0)
    dur += `${dur ? " " : ""}${remMonths} Month${remMonths > 1 ? "s" : ""}`;
  return dur || "< 1 month";
}

export function WorkCard({ profile, isOwner }: WorkCardProps) {
  const works = (profile.works ?? []) as WorkEntry[];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">Work</h3>
        {isOwner && (
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0">
            <Pencil size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {works.length === 0 ? (
        <p className="text-[13px] text-gray-400 italic">No work added.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {works.map((work, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="size-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <Briefcase size={15} className="text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 leading-snug">
                  {work.company}
                </p>
                {work.role && (
                  <p className="text-[12px] text-gray-500">{work.role}</p>
                )}
                {work.from && (
                  <p className="text-[11.5px] text-gray-400 mt-0.5">
                    {formatWorkDate(work.from)} &middot;{" "}
                    {work.current ? "Present" : formatWorkDate(work.to)}{" "}
                    &middot; {getDuration(work.from, work.to, work.current)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {works.length > 1 && (
        <button className="mt-3 w-full text-[12.5px] text-blue-500 hover:underline cursor-pointer bg-transparent border-0 text-center">
          See More
        </button>
      )}
    </div>
  );
}
