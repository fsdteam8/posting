"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Compass, Plus, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { GroupsSidebarItem } from "./group-sidebar-item";
import GroupsIManageSidebar from "./groups-i-manage-sidebar";

interface Props {
  accessToken: string;
}

export default function GroupsSidebar({ accessToken }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-80 flex flex-col h-[92vh]  bg-card border-r border-border sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Groups</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search groups"
              className="w-full h-10 pr-10"
            />
          </div>
          <Button size="icon" variant="outline" className="h-10 w-10">
            <div className="w-4 h-4 flex items-center justify-center">⚙️</div>
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-3">
        <GroupsSidebarItem
          href="/groups/feed"
          label="Your feed"
          isActive={isActive("/groups/feed")}
          icon={Users}
        />
        <GroupsSidebarItem
          href="/groups/discover"
          label="Discover"
          isActive={isActive("/groups/discover")}
          icon={Compass}
        />
        <GroupsSidebarItem
          href="/groups/joined"
          label="Your groups"
          isActive={isActive("/groups/joined")}
          icon={BookOpen}
        />

        <Button
          className="
    w-full
    bg-blue-50 hover:bg-blue-100
    dark:bg-blue-950 dark:hover:bg-blue-900
    text-blue-600
    dark:text-blue-400
    transition-colors duration-200
  "
          onClick={() => router.push("/groups/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create new group
        </Button>

        <div className="pt-4 border-t border-border mt-4">
          <GroupsIManageSidebar accessToken={accessToken} />
        </div>
      </nav>
    </aside>
  );
}
