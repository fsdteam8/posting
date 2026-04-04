import Image from "next/image";

interface CreateStoryCardProps {
  userAvatar?: string;
  onClick: () => void;
}

export function CreateStoryCard({ userAvatar, onClick }: CreateStoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 w-29.5 h-50 rounded-xl overflow-hidden cursor-pointer group focus:outline-none bg-white dark:bg-[#242526] shadow-sm hover:brightness-95 transition-all duration-200"
      style={{ border: "1px solid #e4e6eb" }}
    >
      {/* Top section — user photo */}
      <div className="absolute top-0 left-0 right-0 h-[72%] overflow-hidden bg-gray-200 dark:bg-[#3a3b3c]">
        {userAvatar ? (
          <Image
            src={userAvatar}
            alt="Your photo"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="120px"
            priority
          />
        ) : (
          <div className="w-full h-full bg-[#e4e6eb] dark:bg-[#3a3b3c]" />
        )}
      </div>

      {/* Plus button */}
      <div className="absolute top-[calc(72%-18px)] left-1/2 -translate-x-1/2 z-10">
        <div className="w-9 h-9 rounded-full bg-[#1877f2] border-4 border-white dark:border-[#242526] flex items-center justify-center shadow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3v10M3 8h10"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 h-[28%] flex flex-col items-center justify-end pb-3 bg-white dark:bg-[#242526]">
        <p className="text-[#050505] dark:text-[#e4e6eb] text-[11px] font-semibold mt-4">
          Create Story
        </p>
      </div>
    </button>
  );
}
