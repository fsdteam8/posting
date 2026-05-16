import { SearchEvent } from "@/types/features/search/types";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";

type Props = {
  event: SearchEvent;
};

export default function EventCard({ event }: Props) {
  const host = event.host;
  const fullName = `${host.firstName} ${host.lastName}`;
  const avatarUrl = host.profileImage?.url;

  const date = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E4E6EB] hover:shadow-sm transition-shadow">
      {/* Date block */}
      <div className="shrink-0 w-14 h-14 rounded-xl bg-[#E7F3FF] flex flex-col items-center justify-center border border-[#1877F2]/20">
        <span className="text-[10px] text-[#1877F2] font-semibold uppercase">
          {new Date(event.date).toLocaleString("en-US", { month: "short" })}
        </span>
        <span className="text-xl font-bold text-[#1877F2] leading-tight">
          {new Date(event.date).getDate()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1C1E21] text-sm truncate">
          {event.title}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] text-[#65676B]">
            <Calendar size={11} />
            {date}
          </span>
          {event.location && (
            <span className="flex items-center gap-1 text-[11px] text-[#65676B]">
              <MapPin size={11} />
              {event.location}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {avatarUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image
                src={event.host.profileImage.url}
                alt={event.host.firstName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-[8px] font-bold">
              {host.firstName.charAt(0)}
            </div>
          )}
          <span className="text-[11px] text-[#65676B]">
            Hosted by {fullName}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="shrink-0">
        <button className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1877F2] rounded-lg hover:bg-[#166FE5] transition-colors">
          Interested
        </button>
      </div>
    </div>
  );
}
