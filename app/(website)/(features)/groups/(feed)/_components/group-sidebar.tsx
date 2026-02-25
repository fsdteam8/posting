"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Compass, Plus, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { GroupsSidebarItem } from "./group-sidebar-item";

export function GroupsSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-80 flex flex-col h-screen bg-card border-r border-border sticky top-0">
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
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
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

        <div className="pt-4 border-t border-border mt-4">
          <h3 className="text-sm font-semibold text-muted-foreground px-4 mb-3">
            Groups you manage
          </h3>

          <div className="space-y-2">
            <div className="px-4 py-3 rounded-lg flex items-center gap-3 text-foreground hover:bg-muted transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">DS</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  Devi Shetty Hospital
                </div>
                <div className="text-xs text-muted-foreground">
                  Last active 21h ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Create Group Button */}
      <div className="p-4 border-t border-border">
        <Button className="w-full gap-2" size="lg">
          <Plus className="w-5 h-5" />
          Create new group
        </Button>
      </div>
    </aside>
  );
}
