import {
  SearchGroup,
  SearchType,
  SearchUser,
} from "@/types/features/search/types";
import Image from "next/image";

type Props = {
  activeType: SearchType;
  suggestedUsers?: SearchUser[];
  suggestedGroups?: SearchGroup[];
};

const RELATED_SEARCHES = [
  "Web Design inspiration",
  "Modern Architecture",
  "UI Design Best Practices",
];

export default function SearchSidebar({
  activeType,
  suggestedUsers = [],
  suggestedGroups = [],
}: Props) {
  return (
    <div className="space-y-4">
      {/* Related Searches (all / posts) */}
      {(activeType === "all" || activeType === "posts") && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E4E6EB]">
          <h3 className="font-semibold text-[#1C1E21] mb-3 text-sm">
            Related Searches
          </h3>
          <ul className="space-y-2.5">
            {RELATED_SEARCHES.map((s, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-[#1C1E21] hover:text-[#1877F2] cursor-pointer transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#65676B] shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested for you (users tab) */}
      {activeType === "users" && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E4E6EB]">
          <h3 className="font-semibold text-[#1C1E21] mb-3 text-sm">
            Suggested for you
          </h3>
          {suggestedUsers.length > 0 ? (
            <ul className="space-y-3">
              {suggestedUsers.slice(0, 3).map((u) => (
                <li key={u._id} className="flex items-center gap-2">
                  {u.profileImage?.url ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src={u.profileImage.url}
                        alt={u.firstName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#1877F2] to-[#42B72A] flex items-center justify-center text-white text-xs font-bold">
                      {u.firstName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1C1E21] truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-[11px] text-[#65676B]">
                      {u.followers.length} mutual friends
                    </p>
                  </div>
                  <button className="text-xs font-semibold text-[#1877F2] hover:underline shrink-0">
                    Add friend
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3">
              {["Sarah Rozario", "Plaize Rosline"].map((name, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#1877F2]/20 to-[#42B72A]/20 flex items-center justify-center text-[#1877F2] text-xs font-bold border border-[#E4E6EB]">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1C1E21] truncate">
                      {name}
                    </p>
                    <p className="text-[11px] text-[#65676B]">
                      143 mutual friends
                    </p>
                  </div>
                  <button className="text-xs font-semibold text-[#1877F2] hover:underline shrink-0">
                    Add friend
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Suggested groups (groups tab) */}
      {activeType === "groups" && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E4E6EB]">
          <h3 className="font-semibold text-[#1C1E21] mb-3 text-sm">
            Suggested groups for you
          </h3>
          {suggestedGroups.length > 0 ? (
            <ul className="space-y-3">
              {suggestedGroups.slice(0, 3).map((g) => (
                <li key={g._id} className="flex items-center gap-2">
                  {g.coverImage?.url ? (
                    <div className="relative w-9 h-9 overflow-hidden rounded-lg border border-[#E4E6EB]">
                      <Image
                        src={g.coverImage.url}
                        alt={g.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-linear-to-br from-[#1877F2]/20 to-[#42B72A]/20 flex items-center justify-center text-[#1877F2] text-xs font-bold border border-[#E4E6EB]">
                      {g.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1C1E21] truncate">
                      {g.name}
                    </p>
                    <p className="text-[11px] text-[#65676B]">
                      {g.members.length}k members
                    </p>
                  </div>
                  <button className="text-xs font-semibold text-[#1877F2] hover:underline shrink-0">
                    Join
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3">
              {["UX Case Studies", "La Casa De Papel"].map((name, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-linear-to-br from-[#1877F2]/20 to-[#42B72A]/20 flex items-center justify-center text-[#1877F2] text-xs font-bold border border-[#E4E6EB]">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1C1E21] truncate">
                      {name}
                    </p>
                    <p className="text-[11px] text-[#65676B]">14k members</p>
                  </div>
                  <button className="text-xs font-semibold text-[#1877F2] hover:underline shrink-0">
                    Join
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
