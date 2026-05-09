"use client";

import { Profile } from "@/hooks/profile/use-profile";
import { GraduationCap, Pencil } from "lucide-react";

interface EducationEntry {
  school: string;
  degree?: string;
  from?: string;
  to?: string;
  current?: boolean;
}

interface EducationCardProps {
  profile: Profile;
  isOwner: boolean;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function EducationCard({ profile, isOwner }: EducationCardProps) {
  // Cast education to typed array — adjust shape once real data is available
  const education = (profile.education ?? []) as EducationEntry[];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">Education</h3>
        {isOwner && (
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0">
            <Pencil size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {education.length === 0 ? (
        <p className="text-[13px] text-gray-400 italic">No education added.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {education.map((edu, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="size-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <GraduationCap size={16} className="text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-gray-800 leading-snug">
                  {edu.school}
                </p>
                {edu.degree && (
                  <p className="text-[12px] text-gray-500">{edu.degree}</p>
                )}
                {(edu.from || edu.to) && (
                  <p className="text-[11.5px] text-gray-400 mt-0.5">
                    On {formatDate(edu.from)}
                    {edu.current
                      ? " · Present"
                      : edu.to
                        ? ` · ${formatDate(edu.to)}`
                        : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <button className="mt-3 text-[12.5px] text-blue-500 hover:underline cursor-pointer bg-transparent border-0 px-0">
          See more education
        </button>
      )}
    </div>
  );
}
