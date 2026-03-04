"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DEFAULT_IMAGES } from "@/constants";
import { useGetSingleGroup } from "@/hooks/features/groups/api/use-get-single-group-info";
import { cn, formatCount } from "@/lib/utils";
import {
  BarChart2,
  ClipboardList,
  Crown,
  FileText,
  Flag,
  Globe,
  Home,
  Settings,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  cu: User;
  groupUserName: string;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  pathname: string;
}

const NavItem = ({ href, icon, label, pathname }: NavItemProps) => {
  const isActive = pathname === href;
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full flex justify-start gap-3 px-3 py-2 h-auto rounded-lg font-normal text-sm transition-colors",
          isActive
            ? "bg-blue-50 text-[#1877F2] font-semibold hover:bg-blue-100"
            : "text-foreground hover:bg-muted",
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
            isActive
              ? "bg-blue-100 text-[#1877F2]"
              : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </span>
        {label}
      </Button>
    </Link>
  );
};

const GroupsManageSidebar = ({ cu, groupUserName }: Props) => {
  const { data, isLoading, isError } = useGetSingleGroup({
    accessToken: cu.accessToken,
    username: groupUserName,
  });
  const pathname = usePathname();

  const base = `/groups/${groupUserName}`;

  if (isLoading || isError) return null;
  if (!data || !data.success) return null;

  const group = data.data;
  const groupImage = data.data.coverImage?.url ?? DEFAULT_IMAGES.group.cover;
  const memberCount = group.members.length;

  return (
    <aside className="w-80 flex flex-col h-[92vh] bg-card border-r border-border sticky top-0 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Link href={base}>
          <div
            className={cn(
              "px-3 py-3 rounded-lg flex items-center gap-3 transition-colors cursor-pointer",
              pathname === base ? "bg-blue-50" : "hover:bg-muted",
            )}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
              <Image
                src={groupImage}
                alt={group.name}
                className="w-full h-full object-cover"
                height={40}
                width={40}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{group.name}</div>
              <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                <Globe className="w-3 h-3" />
                <span className="text-[12px] capitalize">
                  {group.privacy} group
                </span>
                <span className="text-[12px]">·</span>
                <span className="text-[12px] font-medium">
                  {formatCount(memberCount)} members
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Top Nav */}
      <div className="p-3 border-b border-border space-y-0.5">
        <NavItem
          href={base}
          icon={<Home className="w-4 h-4" />}
          label="Community Home"
          pathname={pathname}
        />
        <NavItem
          href={`${base}/overview`}
          icon={<BarChart2 className="w-4 h-4" />}
          label="Overview"
          pathname={pathname}
        />
      </div>

      {/* Shadcn Accordion Sections */}
      <div className="p-3 flex-1">
        <Accordion
          type="multiple"
          defaultValue={["admin-tools", "settings", "insights"]}
          className="space-y-1"
        >
          {/* Admin Tools */}
          <AccordionItem value="admin-tools" className="border-none">
            <AccordionTrigger className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:no-underline rounded-lg hover:bg-muted/50 transition-colors">
              Admin Tools
            </AccordionTrigger>
            <AccordionContent className="pb-1 space-y-0.5">
              <NavItem
                href={`${base}/pending-posts`}
                icon={<ClipboardList className="w-4 h-4" />}
                label="Pending Posts"
                pathname={pathname}
              />
              <NavItem
                href={`${base}/group-rules`}
                icon={<Flag className="w-4 h-4" />}
                label="Group Rules"
                pathname={pathname}
              />
              <NavItem
                href={`${base}/reported-content`}
                icon={<ShieldAlert className="w-4 h-4" />}
                label="Member Reported Content"
                pathname={pathname}
              />
              <NavItem
                href={`${base}/community-roles`}
                icon={<Crown className="w-4 h-4" />}
                label="Community Roles"
                pathname={pathname}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Settings */}
          <AccordionItem value="settings" className="border-none">
            <AccordionTrigger className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:no-underline rounded-lg hover:bg-muted/50 transition-colors">
              Settings
            </AccordionTrigger>
            <AccordionContent className="pb-1 space-y-0.5">
              <NavItem
                href={`${base}/settings`}
                icon={<Settings className="w-4 h-4" />}
                label="Group Settings"
                pathname={pathname}
              />
              <NavItem
                href={`${base}/privacy`}
                icon={<FileText className="w-4 h-4" />}
                label="Privacy & Support"
                pathname={pathname}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Insights */}
          <AccordionItem value="insights" className="border-none">
            <AccordionTrigger className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:no-underline rounded-lg hover:bg-muted/50 transition-colors">
              Insights
            </AccordionTrigger>
            <AccordionContent className="pb-1 space-y-0.5">
              <NavItem
                href={`${base}/insights/growth`}
                icon={<TrendingUp className="w-4 h-4" />}
                label="Growth"
                pathname={pathname}
              />
              <NavItem
                href={`${base}/insights/participants`}
                icon={<Users className="w-4 h-4" />}
                label="Participants"
                pathname={pathname}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
};

export default GroupsManageSidebar;
