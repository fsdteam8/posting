import dynamic from "next/dynamic";
import Image from "next/image";
import { Group } from "./joined-group-container";
const JoinedGroupCardAction = dynamic(
  () => import("./joined-group-card-action"),
  {
    ssr: false,
  },
);

interface JoinedGroupCardProps {
  data: Group;
  accessToken: string;
}

export default function JoinedGroupCard({
  data,
  accessToken,
}: JoinedGroupCardProps) {
  const { name: groupName, coverImage } = data;
  const groupImage =
    coverImage && coverImage.url
      ? coverImage.url
      : "https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg";
  return (
    <div className="w-full max-w-101 rounded-lg border border-[#dadde1] bg-[#ffffff] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
      {/* Top section: Avatar + Info */}
      <div className="flex items-center gap-3 p-3 pb-2.5">
        <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={groupImage}
            alt={groupName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold leading-5 text-[#050505]">
            {groupName}
          </span>
          <span className="mt-0.5 text-[13px] leading-4 text-[#65676b]">
            5 weeks ago
          </span>
        </div>
      </div>

      {/* Bottom section: Actions */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        <button
          className="flex h-9 flex-1 items-center justify-center rounded-md bg-[#e7f3ff] text-[15px] font-semibold text-[#1877f2] transition-colors hover:bg-[#dbe7f2]"
          type="button"
        >
          View group
        </button>
        <JoinedGroupCardAction data={data} accessToken={accessToken} />
      </div>
    </div>
  );
}
