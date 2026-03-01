"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { cn } from "@/lib/utils";
import { GroupUser } from "@/types/features/groups";
import { Check, Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TagPeoplePickerProps {
  accessToken: string;
  groupUsername: string;
  value: GroupUser[];
  onChange: (val: GroupUser[]) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TagPeoplePicker = ({
  accessToken,
  groupUsername,
  value,
  onChange,
  onClose,
}: TagPeoplePickerProps) => {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useGetSingleGroup({
    username: groupUsername,
    accessToken,
  });

  const members = useMemo(() => {
    return data?.data.members ?? [];
  }, [data?.data.members]);

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q),
    );
  }, [members, search]);

  const isSelected = (id: string) => value.some((u) => u._id === id);

  const toggle = (member: GroupUser) => {
    if (isSelected(member._id)) {
      onChange(value.filter((u) => u._id !== member._id));
    } else {
      onChange([...value, member]);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-fb-divider">
        <h3 className="font-semibold text-[15px] flex-1 text-center">
          Tag people
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-fb-text-secondary" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-fb-divider">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Selected tags strip */}
      {value.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap px-4 py-2 border-b border-fb-divider">
          {value.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-1 bg-blue-50 text-primary text-[12px] font-medium px-2 py-1 rounded-full"
            >
              <span>
                {u.firstName} {u.lastName}
              </span>
              <button
                type="button"
                onClick={() => toggle(u)}
                className="hover:text-blue-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      <ScrollArea>
        <div className="max-h-75 px-2 py-1">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}

          {isError && (
            <p className="text-center text-[13px] text-red-500 py-6">
              Failed to load members.
            </p>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-center text-[13px] text-fb-text-secondary py-6">
              No members found.
            </p>
          )}

          {!isLoading &&
            filtered.map((member) => {
              const selected = isSelected(member._id);
              const avatarUrl =
                member.profileImage?.url ||
                `https://api.dicebear.com/9.x/avataaars/svg?seed=${member.firstName}&backgroundColor=b6e3f4`;

              return (
                <button
                  key={member._id}
                  type="button"
                  onClick={() => toggle(member)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left",
                    selected ? "bg-blue-50" : "hover:bg-gray-100",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Image
                      src={avatarUrl}
                      alt={`${member.firstName} ${member.lastName}`}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    {selected && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name + username */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-[13px] font-semibold truncate",
                        selected ? "text-primary" : "text-fb-text",
                      )}
                    >
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-[11px] text-fb-text-secondary truncate">
                      @{member.username}
                    </p>
                  </div>

                  {/* Checkbox */}
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      selected
                        ? "bg-primary border-primary"
                        : "border-gray-300",
                    )}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
        </div>
      </ScrollArea>

      {/* Footer — done button */}
      {value.length > 0 && (
        <div className="px-4 py-3 border-t border-fb-divider">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold py-2 rounded-lg transition-colors"
          >
            Done · {value.length} tagged
          </button>
        </div>
      )}
    </div>
  );
};
