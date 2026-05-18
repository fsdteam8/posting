"use client";

import { PeopleYouMayKnowCard } from "@/components/shared/cards/friend-request/people-you-may-know-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSuggestions } from "@/hooks/features/friends/use-get-suggestions";
import { useSendFriendRequest } from "@/hooks/features/friends/use-send-friend-request";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import OnboardingProgress from "../interest/_components/on-boarding-progress";

interface Props {
  accessToken: string;
}

const PeopleYouMayKnowOnBoardingContainer = ({ accessToken }: Props) => {
  const router = useRouter();

  // Track which user ids have been added (for button state)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  // Track which specific card is mid-request
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, isLoading } = useGetSuggestions({
    accessToken,
    limit: 8,
  });

  const { mutate: sendRequest, isPending } = useSendFriendRequest({
    accessToken,
  });

  const handleAddFriend = (id: string) => {
    if (addedIds.has(id) || pendingId === id) return;

    setPendingId(id);
    sendRequest(
      { receiverId: id },
      {
        onSettled: () => {
          setPendingId(null);
          setAddedIds((prev) => new Set(prev).add(id));
        },
      },
    );
  };

  const handleContinue = () => {
    router.push("/onboarding/people-you-may-know/interest");
  };

  const suggestions = data?.data ?? [];

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/onboarding/interest"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <OnboardingProgress currentStep={2} totalSteps={3} />

        {/* Spacer to keep progress bar centred */}
        <div className="w-13" />
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center px-6 pt-8 pb-6">
        <div className="flex w-full max-w-4xl flex-col items-center gap-8">
          {/* Heading */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance text-center sm:text-3xl">
              Suggested for you
            </h1>
            <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground">
              Build your network. Connect with people you may know to see their
              updates and share your thoughts.
            </p>
          </div>

          {/* People grid */}
          <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SuggestionCardSkeleton key={i} />
                ))
              : suggestions.map((person) => (
                  <PeopleYouMayKnowCard
                    key={person._id}
                    id={person._id}
                    name={`${person.firstName} ${person.lastName}`}
                    avatar={person.profileImage?.url ?? ""}
                    mutualFriendsCount={0}
                    onAddFriend={handleAddFriend}
                    isLoading={pendingId === person._id}
                    isAdded={addedIds.has(person._id)}
                  />
                ))}
          </div>

          {/* Empty state — no suggestions returned */}
          {!isLoading && suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No suggestions available right now. You can skip and connect with
              people later.
            </p>
          )}
        </div>
      </main>

      {/* Bottom action bar */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3 px-6 py-5">
          <Button
            variant="outline"
            className="min-w-35 rounded-full"
            onClick={() =>
              router.push("/onboarding/people-you-may-know/interest")
            }
          >
            Skip for Now
          </Button>

          <Button
            className="min-w-35 rounded-full"
            onClick={handleContinue}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin size-4 mr-1.5" />
                Please wait...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
};

// Inline skeleton to match PeopleYouMayKnowCard dimensions
function SuggestionCardSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card p-4 gap-3">
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-4 w-28 rounded" />
      <Skeleton className="h-3 w-20 rounded" />
      <Skeleton className="h-8 w-full rounded-full" />
    </div>
  );
}

export default PeopleYouMayKnowOnBoardingContainer;
