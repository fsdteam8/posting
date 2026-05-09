"use client";

import { Profile } from "@/hooks/profile/use-profile";
import { Cake, Heart, Home, MapPin, MessageCircle, Pencil } from "lucide-react";

interface PersonalDetailsCardProps {
  profile: Profile;
  isOwner: boolean;
}

function DetailRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <span className="text-[13px] text-gray-700 leading-snug">{text}</span>
    </div>
  );
}

function formatDob(dob: string) {
  if (!dob) return null;
  return new Date(dob).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function PersonalDetailsCard({
  profile,
  isOwner,
}: PersonalDetailsCardProps) {
  const dob = formatDob(profile.dob);
  const city = profile.location?.city || profile.currentCity;
  const hometown = profile.hometown;
  const languages = profile.languages?.join(", ");

  const hasAny =
    dob || city || hometown || languages || profile.relationshipStatus;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[15px] font-bold text-gray-900">
          Personal details
        </h3>
        {isOwner && (
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0">
            <Pencil size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {!hasAny && (
        <p className="text-[13px] text-gray-400 italic py-2">
          No personal details yet.
        </p>
      )}

      <div className="divide-y divide-gray-50">
        {city && (
          <DetailRow
            icon={<MapPin size={16} />}
            text={
              <>
                Lives in <span className="font-medium">{city}</span>
              </>
            }
          />
        )}
        {hometown && (
          <DetailRow
            icon={<Home size={16} />}
            text={
              <>
                From <span className="font-medium">{hometown}</span>
              </>
            }
          />
        )}
        {dob && <DetailRow icon={<Cake size={16} />} text={dob} />}
        {profile.relationshipStatus && (
          <DetailRow
            icon={<Heart size={16} />}
            text={
              <span>
                <span className="font-medium capitalize">
                  {profile.relationshipStatus}
                </span>
              </span>
            }
          />
        )}
        {languages && (
          <DetailRow icon={<MessageCircle size={16} />} text={languages} />
        )}
      </div>
    </div>
  );
}
