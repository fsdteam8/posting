"use client";

import ErrorScreen from "@/components/shared/screens/error-screen";
import { baseURL } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";

import dynamic from "next/dynamic";
const JoinedGroupCard = dynamic(() => import("./joined-group-card"), {
  ssr: false,
});

interface Props {
  accessToken: string;
}

const JoinedGroupContainer = ({ accessToken }: Props) => {
  const router = useRouter();
  const { data, isLoading, isFetching, isError, error, refetch } =
    useQuery<GroupsResponse>({
      queryKey: ["joined-group", accessToken],
      enabled: !!accessToken,
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

  // ---------- Loading (Facebook-style skeleton list) ----------
  if (isLoading) {
    return (
      <div className="space-y-3">
        <JoinedGroupCardSkeleton />
        <JoinedGroupCardSkeleton />
        <JoinedGroupCardSkeleton />
        <JoinedGroupCardSkeleton />
      </div>
    );
  }

  // ---------- Error ----------
  if (isError) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    return (
      <ErrorScreen
        message={message}
        onRetry={refetch}
        isRefetching={isFetching}
      />
    );
  }

  const groups = data?.data ?? [];

  // ---------- Empty ----------
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center">
        <p className="text-base font-semibold text-gray-900">
          You haven’t joined any groups yet
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Join groups to see updates and discussions here.
        </p>

        <div className="mt-4 flex justify-center gap-2">
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
            onClick={() => router.push("/groups/discover")}
          >
            Discover groups
          </button>
          <button
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer"
            onClick={() => router.push("/groups/create")}
          >
            Create group
          </button>
        </div>
      </div>
    );
  }

  // ---------- Success ----------
  return (
    <div className="space-y-3">
      {/* subtle top bar like FB when background refetch happens */}
      {isFetching && (
        <div className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-600">
          Updating…
        </div>
      )}

      <div>
        <h1 className="font-medium text-sm">
          All groups you&apos;ve joined ({groups.length})
        </h1>
      </div>

      <div className="w-full grid grid-cols-4 gap-5">
        {groups.map((item) => (
          <JoinedGroupCard
            key={item._id}
            data={item}
            accessToken={accessToken}
          />
        ))}
      </div>
    </div>
  );
};

export default JoinedGroupContainer;

/** Simple skeleton that visually matches a card list */
function JoinedGroupCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
      <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200" />
    </div>
  );
}

// ---------------- Types ----------------

export interface GroupsResponse {
  success: boolean;
  message: string;
  data: Group[];
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  category: string;
  privacy: "public" | "private";
  rules: string[];
  pendingMembers: Member[];
  members: Member[];
  admins: Member[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  coverImage: {
    url: string;
    public_id: string;
  };
}

export interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: ProfileImage;
}

export interface ProfileImage {
  public_id: string;
  url: string;
}
