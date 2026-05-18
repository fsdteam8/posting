"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  LogOut,
  MessageSquareWarning,
  Moon,
  Settings,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { DisplayAccessibility } from "./subMenu/display-accessibility";

interface UserProfile {
  name: string;
  avatarUrl: string;
}

interface Page {
  id: string;
  name: string;
  avatarUrl: string;
}

interface ProfileMenuProps {
  user: UserProfile;
  pages: Page[];
  activeIdentity: { type: "user" | "page"; id?: string };
  onSwitchIdentity: (identity: { type: "user" | "page"; id?: string }) => void;
}

type Panel = "main" | "display";

export function ProfileMenu({
  user,
  pages,
  activeIdentity,
  onSwitchIdentity,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("main");

  const currentName =
    activeIdentity.type === "user"
      ? user.name
      : (pages.find((p) => p.id === activeIdentity.id)?.name ?? user.name);

  const currentAvatar =
    activeIdentity.type === "user"
      ? user.avatarUrl
      : (pages.find((p) => p.id === activeIdentity.id)?.avatarUrl ??
        user.avatarUrl);

  // Reset panel when popover closes
  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) setPanel("main");
  };

  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open profile menu"
        >
          <Avatar className="size-9 ring-2 ring-border">
            <AvatarImage src={currentAvatar} alt={currentName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {currentName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-25 truncate text-sm font-semibold text-foreground md:inline-block">
            {currentName}
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-90 rounded-xl border bg-card p-0 shadow-xl"
      >
        <ScrollArea className="max-h-[calc(100vh-80px)]">
          {panel === "display" ? (
            <DisplayAccessibility onBack={() => setPanel("main")} />
          ) : (
            <div className="p-4">
              {/* Profile Card */}
              <div className="rounded-lg border bg-card shadow-sm">
                <button
                  onClick={() => {
                    onSwitchIdentity({ type: "user" });
                    setOpen(false);
                    router.push("/profile");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-t-lg p-3 text-left transition-colors hover:bg-secondary",
                    activeIdentity.type === "user" && "bg-secondary",
                  )}
                >
                  <Avatar className="size-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[15px] font-semibold text-foreground">
                    {user.name}
                  </span>
                </button>

                {/* Pages */}
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSwitchIdentity({ type: "page", id: page.id });
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 border-t px-3 py-2.5 text-left transition-colors hover:bg-secondary",
                      activeIdentity.type === "page" &&
                        activeIdentity.id === page.id &&
                        "bg-secondary",
                    )}
                  >
                    <Avatar className="size-9 rounded-lg">
                      <AvatarImage src={page.avatarUrl} alt={page.name} />
                      <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                        {page.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[15px] font-medium text-foreground">
                      {page.name}
                    </span>
                  </button>
                ))}

                {/* See all profiles */}
                <button className="flex w-full items-center justify-center gap-2 rounded-b-lg border-t px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                  <Users className="size-4" />
                  See all profiles
                </button>
              </div>

              <Separator className="my-3" />

              {/* Menu Items */}
              <nav className="flex flex-col">
                <MenuItem
                  icon={ExternalLink}
                  label="Meta Business Suite"
                  trailing="external"
                />
                <MenuItem
                  icon={Settings}
                  label="Settings & privacy"
                  trailing="chevron"
                />
                <MenuItem
                  icon={HelpCircle}
                  label="Help & support"
                  trailing="chevron"
                />
                <MenuItem
                  icon={Moon}
                  label="Display & accessibility"
                  trailing="chevron"
                  onSelect={() => setPanel("display")}
                />
                <MenuItem
                  icon={MessageSquareWarning}
                  label="Give feedback"
                  shortcut="Ctrl B"
                />
                <MenuItem
                  icon={LogOut}
                  label="Log out"
                  onSelect={() =>
                    signOut({
                      redirectTo: "/login",
                    })
                  }
                />
              </nav>

              {/* Footer */}
              <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                <span className="cursor-pointer hover:underline">Privacy</span>
                <span>{"·"}</span>
                <span className="cursor-pointer hover:underline">Terms</span>
                <span>{"·"}</span>
                <span className="cursor-pointer hover:underline">
                  Advertising
                </span>
                <span>{"·"}</span>
                <span className="cursor-pointer hover:underline">
                  Ad Choices
                </span>
                <span>{"·"}</span>
                <span className="cursor-pointer hover:underline">Cookies</span>
                <span>{"·"}</span>
                <span className="cursor-pointer hover:underline">More</span>
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function MenuItem({
  icon: Icon,
  label,
  trailing,
  shortcut,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  trailing?: "chevron" | "external";
  shortcut?: string;
  onSelect?: () => void;
}) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-secondary"
      onClick={() => onSelect?.()}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-foreground">
        <Icon className="size-5" />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-[15px] font-medium text-foreground">{label}</span>
        {shortcut && (
          <span className="text-xs text-muted-foreground">{shortcut}</span>
        )}
      </span>
      {trailing === "chevron" && (
        <ChevronRight className="size-5 text-muted-foreground" />
      )}
      {trailing === "external" && (
        <ExternalLink className="size-4 text-muted-foreground" />
      )}
    </button>
  );
}
