import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { baseURL } from "@/constants";
import { getQueryClient } from "@/lib/tanstack-query/query-client";
import type { ApiRes, Page } from "@/types/features/pages";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { PageCover } from "./_components/page-cover";
import { PageInfoHeader } from "./_components/page-info-header";
import { PageTabNavigation } from "./_components/page-tab-navigation";

interface Props {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

const Layout = async ({ children, params }: Props) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["page", id],
    queryFn: async (): Promise<ApiRes<Page>> => {
      const res = await fetch(`${baseURL}/pages/${id}`, {
        headers: { Authorization: `Bearer ${cu.user.accessToken}` },
      });
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Card className="py-0 rounded-xl overflow-hidden border border-gray-100 shadow-sm gap-0">
          <PageCover pageId={id} accessToken={cu.user.accessToken} />
          <PageInfoHeader pageId={id} accessToken={cu.user.accessToken} />
          <PageTabNavigation pageId={id} />
        </Card>

        <div className="mt-4">{children}</div>
      </div>
    </HydrationBoundary>
  );
};

export default Layout;
