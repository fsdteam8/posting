import { auth } from "@/auth";
import { MiniChatProvider } from "@/components/shared/messenger/mini-chat-provider";
import Navbar from "@/components/shared/navbar/navbar";
import { baseURL } from "@/constants";
import { getQueryClient } from "@/lib/tanstack-query/query-client";
import { CallProvider } from "@/providers/call-provider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const WebsiteLayout = async ({ children }: Props) => {
  const cu = await auth();

  // is not loggedin then redirect to the sign in page for authenticate
  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  const queryClient = getQueryClient();

  // Prefetch profile before render — same queryKey as useProfile
  await queryClient.prefetchQuery({
    queryKey: ["profile"],
    queryFn: () =>
      fetch(`${baseURL}/users`, {
        headers: { Authorization: `Bearer ${cu.user.accessToken}` },
      })
        .then((res) => res.json())
        .then((res) => res.data),
  });
  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CallProvider accessToken={cu.user.accessToken}>
          <MiniChatProvider accessToken={cu.user.accessToken}>
            <Navbar accessToken={cu.user.accessToken} />
            {children}
          </MiniChatProvider>
        </CallProvider>
      </HydrationBoundary>
    </div>
  );
};

export default WebsiteLayout;
