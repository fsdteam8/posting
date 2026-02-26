import { auth } from "@/auth";
import { baseURL } from "@/constants";
import { getQueryClient } from "@/lib/tanstack-query/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import JoinedGroupContainer from "./_components/joined-group-container";

const Page = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");
  const accessToken = cu.user.accessToken;

  const queryClient = getQueryClient();

  // Prefetch profile before render — same queryKey as useProfile
  await queryClient.prefetchQuery({
    queryKey: ["joined-group", accessToken],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/groups?mode=joined`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // handle non-2xx as errors (important)
      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          message = body?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return res.json();
    },
    staleTime: 30_000,
    retry: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JoinedGroupContainer accessToken={cu.user.accessToken} />
    </HydrationBoundary>
  );
};

export default Page;
