"use client";

import GroupPostCard from "@/components/shared/features/posts/post-card";
import { useSearch } from "@/hooks/features/search/api/use-search";
import { SearchType } from "@/types/features/search/types";
import { Loader2 } from "lucide-react";
import { Session } from "next-auth";
import EventCard from "./EventCard";
import GroupCard from "./GroupCard";
import SearchSidebar from "./SearchSidebar";
import UserCard from "./UserCard";

type Props = {
  query: string;
  type: SearchType;
  accessToken: string;
  user: Session["user"];
};

export default function SearchResultsClient({
  query,
  type,
  accessToken,
  user,
}: Props) {
  const { data, isLoading, isError, error } = useSearch({
    query,
    type,
    limit: 10,
    accessToken,
  });

  const results = data?.data;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-[#65676B]">
          <Loader2 className="animate-spin mb-3" size={28} />
          <p className="text-sm">Searching...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <p className="text-sm font-medium">
            {error?.message ?? "Something went wrong"}
          </p>
        </div>
      );
    }

    if (!results) return null;

    const hasUsers = results.users.length > 0;
    const hasPosts = results.posts.length > 0;
    const hasGroups = results.groups.length > 0;
    const hasEvents = results.events.length > 0;
    const hasAny = hasUsers || hasPosts || hasGroups || hasEvents;

    if (!hasAny) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-[#65676B]">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mb-3 opacity-40"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p className="text-sm font-medium">
            No results for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs mt-1 opacity-70">Try a different search term</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Users */}
        {(type === "all" || type === "users") &&
          hasUsers &&
          results.users.map((u) => (
            <UserCard
              key={u._id}
              user={u}
              accessToken={accessToken}
              loggedinUserId={user.id}
            />
          ))}

        {/* Posts */}
        {(type === "all" || type === "posts") &&
          hasPosts &&
          results.posts.map((p) => (
            <GroupPostCard
              key={p._id}
              post={p}
              accessToken={accessToken}
              loggedInUserId={user.id}
            />
          ))}

        {/* Groups */}
        {(type === "all" || type === "groups") &&
          hasGroups &&
          results.groups.map((g) => <GroupCard key={g._id} group={g} />)}

        {/* Events */}
        {(type === "all" || type === "events") &&
          hasEvents &&
          results.events.map((e) => <EventCard key={e._id} event={e} />)}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Main results */}
      <div>{renderContent()}</div>

      {/* Right sidebar */}
      <div className="hidden lg:block">
        <SearchSidebar
          activeType={type}
          suggestedUsers={results?.users}
          suggestedGroups={results?.groups}
        />
      </div>
    </div>
  );
}
