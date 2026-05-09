"use client";

import { Profile } from "@/hooks/profile/use-profile";
import { AtSign, Mail, Pencil, Phone, Pin } from "lucide-react";

interface ContactInfoCardProps {
  profile: Profile;
  isOwner: boolean;
}

function ContactRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <span className="text-[12.5px] text-blue-500 break-all leading-snug">
        {children}
      </span>
    </div>
  );
}

export function ContactInfoCard({ profile, isOwner }: ContactInfoCardProps) {
  const socialLinks = (profile.socialLinks ?? []) as {
    platform: string;
    url: string;
    handle?: string;
  }[];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-bold text-gray-900">Contact Info</h3>
        {isOwner && (
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0">
            <Pencil size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex flex-col">
        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 py-1.5 border-b border-gray-50 mb-1">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-blue-500 hover:underline"
              >
                {link.handle ?? link.url}
              </a>
            ))}
          </div>
        )}

        {/* Website */}
        {profile.website && (
          <ContactRow icon={<Pin size={15} />}>
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {profile.website}
            </a>
          </ContactRow>
        )}

        {/* Username */}
        {profile.username && (
          <ContactRow icon={<AtSign size={15} />}>
            @{profile.username}
          </ContactRow>
        )}

        {/* Email */}
        {profile.email && (
          <ContactRow icon={<Mail size={15} />}>
            Email:{" "}
            <a
              href={`mailto:${profile.email}`}
              className="hover:underline text-blue-500"
            >
              {profile.email}
            </a>
          </ContactRow>
        )}

        {/* Phone */}
        {profile.phone && (
          <ContactRow icon={<Phone size={15} />}>
            Phone: {profile.phone}
          </ContactRow>
        )}

        {!profile.email &&
          !profile.phone &&
          !profile.website &&
          socialLinks.length === 0 && (
            <p className="text-[13px] text-gray-400 italic py-1">
              No contact info added.
            </p>
          )}
      </div>
    </div>
  );
}
