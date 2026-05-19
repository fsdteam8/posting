"use client";

import { useGetPageById } from "@/hooks/features/pages/use-get-page-by-id";
import { useProfile } from "@/hooks/profile/use-profile";
import {
  AtSign,
  Clock,
  Globe,
  Link2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { PageDetailsEditDialog } from "./page-details-edit-dialog";

interface Props {
  pageId: string;
  accessToken: string;
}

export function PageDetailsSidebar({ pageId, accessToken }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useGetPageById({ pageId, accessToken });
  const { data: profile } = useProfile(accessToken);

  if (isLoading || !data?.data) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="h-5 w-20 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const page = data.data;
  const { contact, location, hours, category } = page;

  const isAdmin = profile
    ? (page.admins as Array<string | { _id: string }>).some(
        (a) => (typeof a === "string" ? a : a._id) === profile._id,
      )
    : false;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-base font-bold text-gray-900">Details</h2>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Edit details"
          >
            <Pencil size={14} className="text-gray-600" />
          </button>
        )}
      </div>

      <ul className="px-4 pb-3 space-y-2.5 text-[13px] text-gray-700">
        {category && (
          <li className="flex items-start gap-2.5">
            <Globe size={16} className="text-gray-500 mt-0.5 shrink-0" />
            <span>Page: {category}</span>
          </li>
        )}

        <li className="flex items-start gap-2.5">
          <Clock size={16} className="text-gray-500 mt-0.5 shrink-0" />
          <span>{hours?.status ?? "No hours available"}</span>
        </li>

        <li className="flex items-start gap-2.5">
          <Star size={16} className="text-gray-500 mt-0.5 shrink-0" />
          <span>100% recommend (5 reviews)</span>
        </li>

        {contact?.website && (
          <li className="flex items-start gap-2.5">
            <Link2 size={16} className="text-gray-500 mt-0.5 shrink-0" />
            <a
              href={contact.website}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline break-all"
            >
              {contact.website}
            </a>
          </li>
        )}

        {(location?.address || location?.city) && (
          <li className="flex items-start gap-2.5">
            <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" />
            <span>
              {[location.address, location.city].filter(Boolean).join(", ")}
            </span>
          </li>
        )}
      </ul>

      {(contact?.email || contact?.phone) && (
        <div className="px-4 pb-3">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Contact Info</h3>
          <ul className="space-y-2 text-[13px] text-gray-700">
            {contact?.email && (
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-gray-500 shrink-0" />
                <span className="break-all">{contact.email}</span>
              </li>
            )}
            {contact?.phone && (
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-gray-500 shrink-0" />
                <span>{contact.phone}</span>
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <AtSign size={16} className="text-gray-500 shrink-0" />
              <span className="text-primary cursor-pointer hover:underline">
                {page.slug || page.name.toLowerCase().replace(/\s+/g, "")}
              </span>
            </li>
          </ul>
        </div>
      )}

      <div className="border-t border-gray-100 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Communities</h3>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
            <Users size={14} />
          </div>
          <div className="text-[13px]">
            <p className="font-medium text-gray-900">No communities yet</p>
            <p className="text-gray-500 text-xs">Join groups to grow</p>
          </div>
        </div>
      </div>

      <button className="w-full text-center text-[13px] text-primary font-semibold hover:bg-gray-50 py-2.5 border-t border-gray-100 rounded-b-xl">
        See More
      </button>

      {isAdmin && (
        <PageDetailsEditDialog
          page={page}
          accessToken={accessToken}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
