import { SearchGroup } from "@/types/features/search/types";
import { Globe, LayoutGrid, Users } from "lucide-react";
import Image from "next/image";

type Props = {
  group: SearchGroup;
};

export default function GroupCard({ group }: Props) {
  const coverUrl = group.coverImage?.url;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E4E6EB] hover:shadow-sm transition-shadow">
      {/* Cover / Avatar */}
      <div className="shrink-0">
        {coverUrl ? (
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={group.coverImage?.url || "/placeholder-group.jpg"}
              alt={group.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-linear-to-br from-[#1877F2]/20 to-[#42B72A]/20 flex items-center justify-center text-[#1877F2] text-xl font-bold border border-[#E4E6EB]">
            {group.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1C1E21] text-sm truncate">
          {group.name}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] text-[#65676B]">
            <Globe size={11} />
            {group.privacy === "public" ? "Public" : "Private"}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#65676B]">
            <Users size={11} />
            {(group.members.length / 1000).toFixed(1)}M Members
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#65676B]">
            <LayoutGrid size={11} />
            10+ posts a day
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-2">
        <button className="px-3 py-1.5 text-xs font-semibold text-[#1877F2] border border-[#1877F2] rounded-lg hover:bg-[#E7F3FF] transition-colors">
          View Group
        </button>
        {!group.isJoined && (
          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1877F2] rounded-lg hover:bg-[#166FE5] transition-colors">
            Join
          </button>
        )}
      </div>
    </div>
  );
}
