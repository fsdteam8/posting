import { auth } from "@/auth";
import GroupCoverPhoto from "@/components/shared/features/group/group-cover-photo";
import GroupInfoHeader from "@/components/shared/features/group/group-info-header";
import GroupTabNavigation from "@/components/shared/features/group/group-tab-navigation";
import { MarkAsVisitedGroup } from "@/components/shared/features/group/provider/mark-as-visited-group";
import { Card } from "@/components/ui/card";
import { baseURL } from "@/constants";
import { getQueryClient } from "@/lib/tanstack-query/query-client";
import { GetSingleGroupResponse } from "@/types/features/groups";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  params: Promise<{ username: string }>;
}

const Layout = async ({ children, params }: Props) => {
  const cu = await auth();

  const queryClient = getQueryClient();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  const { username } = await params;

  // ✅ Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: ["group", username],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/groups/username/${username}`, {
        headers: { Authorization: `Bearer ${cu.user.accessToken}` },
      });

      // optional: handle non-2xx better
      const json = (await res.json()) as GetSingleGroupResponse;

      return json;
    },
  });

  const base = `/groups/view/${username}`;

  const navItems = [
    { label: "About", href: `${base}/about` },
    { label: "Discussion", href: base }, // index

    { label: "Featured", href: `${base}/announcements` },
    { label: "People", href: `${base}/members` },
    { label: "Media", href: `${base}/media` },
  ];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Card className="py-0 rounded-none px-5 pt-5">
        <GroupCoverPhoto
          username={username}
          accessToken={cu.user.accessToken}
        />
        <GroupInfoHeader
          username={username}
          accessToken={cu.user.accessToken}
          loggedinUserId={cu.user.id}
        />
        <GroupTabNavigation groupId={username} navItems={navItems} base={base}>
          <></>
        </GroupTabNavigation>
      </Card>

      <div className="p-5 bg-[#F2F4F7]">{children}</div>

      <MarkAsVisitedGroup
        groupUserName={username}
        accessToken={cu.user.accessToken}
      />
    </HydrationBoundary>
  );
};

export default Layout;
