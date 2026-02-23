import { LeftSidebar } from "./_components/left-sidebar/left-sidebar";
import { RightSidebar } from "./_components/right-sidebar/right-side-card";

export default function HomeLayout() {
  return (
    <div className=" flex justify-between ">
      {/* Left Sidebar */}
      <div className="hidden w-70  shrink-0 lg:block px-4">
        <div
          className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <LeftSidebar />
        </div>
      </div>

      {/* Center Feed */}
      <div className="w-full max-w-170 px-0 sm:px-4">Center</div>

      {/* Right Sidebar */}
      <div className="hidden w-[320px] shrink-0 xl:block px-4">
        <div
          className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
