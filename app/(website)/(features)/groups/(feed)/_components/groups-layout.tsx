"use client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { GroupsSidebar } from "./group-sidebar";

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();

  const isGroupView = pathName.startsWith("/groups/view/");
  return (
    <div className="flex h-[92vh] bg-background">
      <GroupsSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className={cn("mx-auto", isGroupView ? "p-0" : "p-5")}>
          {children}
        </div>
      </main>
    </div>
  );
}
