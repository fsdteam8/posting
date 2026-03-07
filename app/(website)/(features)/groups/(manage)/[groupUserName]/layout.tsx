import { auth } from "@/auth";
import { MarkAsVisitedGroup } from "@/components/shared/features/group/provider/mark-as-visited-group";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import GroupsManageSidebar from "./_components/sidebar/groups-manage-sidebar";

interface Props {
  children: ReactNode;
  params: Promise<{ groupUserName: string }>;
}

const Layout = async ({ children, params }: Props) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  const { groupUserName } = await params;
  return (
    <div className="flex h-[92vh] bg-background">
      <GroupsManageSidebar cu={cu.user} groupUserName={groupUserName} />
      <main className="flex-1 overflow-y-auto">
        <div className={cn("mx-auto", "p-0")}>{children}</div>
      </main>

      <MarkAsVisitedGroup
        groupUserName={groupUserName}
        accessToken={cu.user.accessToken}
      />
    </div>
  );
};

export default Layout;
