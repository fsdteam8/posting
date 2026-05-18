import { auth } from "@/auth";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SearchType } from "@/types/features/search/types";
import DefaultSearchView from "./_components/(All/Posts/People/Groups/Events)/DefaultSearchView";
import SearchResultsClient from "./_components/(All/Posts/People/Groups/Events)/SearchResultsClient";
import SearchTabs from "./_components/SearchTabs";

type Props = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

const VALID_TYPES: SearchType[] = ["all", "users", "posts", "groups", "events"];

function resolveType(raw?: string): SearchType {
  if (raw && VALID_TYPES.includes(raw as SearchType)) {
    return raw as SearchType;
  }
  return "all";
}

const SearchPage = async ({ searchParams }: Props) => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/login");

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeType = resolveType(params.type);
  const accessToken = cu.user.accessToken as string;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* <SearchInput defaultValue={query} /> */}
          {query && (
            <div className="flex-1">
              <SearchTabs activeType={activeType} query={query} />
            </div>
          )}
        </div>

        {/* Content */}
        {!query ? (
          /* Default view shown before any search */
          <DefaultSearchView />
        ) : (
          /* Results */
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20 text-[#65676B]">
                <Loader2 className="animate-spin mr-2" size={20} />
                <span className="text-sm">Loading results...</span>
              </div>
            }
          >
            <SearchResultsClient
              query={query}
              type={activeType}
              accessToken={accessToken}
              user={cu.user}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
