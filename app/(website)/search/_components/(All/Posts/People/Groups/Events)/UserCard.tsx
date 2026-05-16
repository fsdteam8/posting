import { SearchUser } from "@/types/features/search/types";
import { UserPlus } from "lucide-react";
import Image from "next/image";

type Props = {
  user: SearchUser;
};

export default function UserCard({ user }: Props) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const avatarUrl = user.profileImage?.url;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E4E6EB] hover:shadow-sm transition-shadow">
      {/* Avatar */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image
              src={user.profileImage.url}
              alt={`${user.firstName} ${user.lastName}`}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#1877F2] to-[#42B72A] flex items-center justify-center text-white text-lg font-bold border-2 border-[#E4E6EB]">
            {user.firstName.charAt(0)}
          </div>
        )}
        {user.isOnline && (
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#42B72A] rounded-full border-2 border-white" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1C1E21] text-sm truncate">
          {fullName}
        </p>
        <p className="text-xs text-[#65676B] truncate">@{user.username}</p>
        {/* Mutual friends avatars placeholder row */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex -space-x-1.5">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="w-5 h-5 rounded-full bg-linear-to-br from-gray-200 to-gray-300 border border-white"
              />
            ))}
          </div>
          <span className="text-[11px] text-[#65676B]">
            {user.followers.length} mutual friends
          </span>
        </div>
      </div>

      {/* Add Friend Button */}
      <button className="shrink-0 p-2 rounded-full bg-[#E7F3FF] text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors">
        <UserPlus size={18} />
      </button>
    </div>
  );
}
