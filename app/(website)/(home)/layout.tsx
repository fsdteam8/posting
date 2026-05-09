import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CenterPartContainer from "./_components/center-part/center-part-container";
import LeftSidebar from "./_components/left-sidebar/left-sidebar";
import { RightSidebar } from "./_components/right-sidebar/right-side-card";

export default async function HomeLayout() {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  return (
    <div className=" flex justify-between bg-[#F2F3F5] ">
      {/* Left Sidebar */}
      <div className="hidden w-70  shrink-0 lg:block px-4">
        <div
          className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <LeftSidebar accessToken={cu.user.accessToken} />
        </div>
      </div>

      {/* Center Feed */}
      <div className="w-full max-w-170 px-0 sm:px-4">
        <CenterPartContainer user={cu.user} />
      </div>

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
